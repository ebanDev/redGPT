import OpenAI from 'openai';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    
    console.time('Total Time');
    const sourceLinks = query.sourceLinks;
    const openaiApiKey = query.openaiApiKey;
    const userQuery = query.query;

    if (!openaiApiKey) {
        return `No API Key provided`;
    }

    console.time('OpenAI Client Initialization');
    const client = new OpenAI({
        apiKey: openaiApiKey,
    });
    console.timeEnd('OpenAI Client Initialization');

    console.time('Vector Store Creation');
    const vectorStore = await client.beta.vectorStores.create({
        name: userQuery.replace(/[^a-zA-Z0-9]/g, ''),
    });
    console.timeEnd('Vector Store Creation');

    const articleStreamList = [];
    const articleIdsList = [];

    console.time('Fetch and Parse Articles');
    await Promise.all(sourceLinks.split(',').map(async (link) => {
        try {
            console.time(`Fetch ${link}`);
            const htmlPage = await fetch(link).then((response) => response.text());
            console.timeEnd(`Fetch ${link}`);

            console.time(`Parse ${link}`);
            const doc = new JSDOM(htmlPage, { url: link });
            const reader = new Readability(doc.window.document);
            const article = reader.parse();
            console.timeEnd(`Parse ${link}`);

            const articleBlob = new Blob([article?.content], { type: 'text/html' });
            let sanitizedTitle = article?.title?.toLowerCase().replace(/[^a-z-_]/g, '') || `random-${Math.random().toString(36).substring(2, 15)}`;
            const articleFile = new File([articleBlob], `${sanitizedTitle}.html`, { type: 'text/html' });
            
            articleStreamList.push(articleFile);
            articleIdsList.push(article?.title);

        } catch (error) {
            console.error(`Failed to fetch or parse article from link: ${link}`, error);
        }
    }));
    console.timeEnd('Fetch and Parse Articles');

    console.time('File Batch Upload');
    await client.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, { files: articleStreamList });
    console.timeEnd('File Batch Upload');

    console.time('Update Assistant');
    await client.beta.assistants.update("asst_t8CuPPNq4g2XO3vPha2XOuw4", {
        tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
    });
    console.timeEnd('Update Assistant');

    console.time('Create Thread');
    const thread = await client.beta.threads.create({
        messages: [{ role: "user", content: userQuery }],
    });
    console.timeEnd('Create Thread');
    
    console.timeEnd('Total Time');
    return thread.id;
});
