import OpenAI from 'openai';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const sourceLinks = query.sourceLinks
    const openaiApiKey = query.openaiApiKey
    const userQuery = query.query

    if (!openaiApiKey) {
        return `No API Key provided`
    }

    const client = new OpenAI({
        apiKey: openaiApiKey,
    });

    const vectorStore = await client.beta.vectorStores.create({
        name: userQuery.replace(/[^a-zA-Z0-9]/g, ''),
    });

    const articleStreamList = []
    const articleIdsList = []

    for (const link of sourceLinks.split(',')) {
        try {
            const htmlPage = await fetch(link).then((response) => response.text());
            const doc = new JSDOM(htmlPage, {
                url: link
            });
            const reader = new Readability(doc.window.document);
            const article = reader.parse();
            const articleBlob = new Blob([article?.content], { type: 'text/html' });
            const articleFile = new File([articleBlob], `${article?.title}.html`, { type: 'text/html' });
    
            articleStreamList.push(articleFile);
            articleIdsList.push(article?.title);
        } catch (error) {
            console.error(`Failed to fetch or parse article from link: ${link}`, error);
            continue;
        }
    }

    await client.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {files: articleStreamList});

    await client.beta.assistants.update("asst_t8CuPPNq4g2XO3vPha2XOuw4", {
        tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
    });

    const thread = await client.beta.threads.create({
        messages: [{ role: "user", content: userQuery }],
    });

    
    return thread.id

});