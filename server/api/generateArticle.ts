import OpenAI from 'openai';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
    const eventStream = createEventStream(event)

    eventStream.push('info: Starting article writing process.')
    eventStream.onClosed(async () => {
        await eventStream.close()
    })
    const session = await getServerSession(event)
    const queryUrl = event.node.req.url
    const querystring = queryUrl.substring(queryUrl.indexOf('?') + 1)
    console.log(querystring)
    const queryArgs = querystring.split('&')
    let query = {}
    queryArgs.forEach((arg) => {
        const [key, value] = arg.split('=')
        query[key] = decodeURIComponent(value)
    })

    const sourceLinks = query.sourceLinks;
    let openaiApiKey = query.openaiApiKey;
    const userQuery = query.query;
    const articleLanguage = query.lang;
    const articleLength = query.articleLength;

    if (!openaiApiKey) {
        if (!session) {
            return { status: 'unauthenticated!' }
        } else {
            openaiApiKey = process.env.OPENAI_API_KEY;
        }
    }

    const client = new OpenAI({
        apiKey: openaiApiKey,
    });

    const vectorStore = await client.beta.vectorStores.create({
        name: userQuery.replace(/[^a-zA-Z0-9]/g, ''),
    });

    const articleStreamList = [];
    const articleIdsList = [];

    await Promise.all(sourceLinks.split(',').map(async (link) => {
        try {
            eventStream.send();
            const htmlPage = await Promise.race([
                fetch(link).then((response) => response.text()),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), 3000))
            ]);
            eventStream.push(`info: Fetching and parsing article from link: ${link}`);

            const doc = new JSDOM(htmlPage, { url: link });
            const reader = new Readability(doc.window.document);
            const article = reader.parse();

            const articleBlob = new Blob([article?.content], { type: 'text/html' });
            let sanitizedTitle = article?.title?.toLowerCase().replace(/[^a-z-_]/g, '') || `random-${Math.random().toString(36).substring(2, 15)}`;
            const articleFile = new File([articleBlob], `${sanitizedTitle}.html`, { type: 'text/html' });

            articleStreamList.push(articleFile);
            articleIdsList.push(article?.title);

        } catch (error) {
            console.error(`Failed to fetch or parse article from link: ${link}`, error);
        }
    }));

    eventStream.push(`info: Uploading articles to AI Engine.`);
    eventStream.send();
    await client.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, { files: articleStreamList });

    eventStream.push(`info: Updating Assistant with new vector store.`);
    eventStream.send();
    await client.beta.assistants.update("asst_t8CuPPNq4g2XO3vPha2XOuw4", {
        tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
    });

    eventStream.push(`info: Creating new AI writing session.`);
    eventStream.send();
    const thread = await client.beta.threads.create({
        messages: [{ role: "user", content: `Write a ${articleLength} article about the following topic : ${userQuery} in ${articleLanguage} based on the sources of your knowledge base, you should always cite your sources. This article should have a marxist materialist point of view and a deep clever analysis of the topic. You can use all of Markdown features to make it more pleasant to read.` }],
    });
    eventStream.push(`info: Writing article.`);
    eventStream.push(`step: none`)
    eventStream.push(`threadId: ${thread.id}`)
    eventStream.send();
    

    const stream = await client.beta.threads.runs
        .create(thread.id, {
            assistant_id: "asst_t8CuPPNq4g2XO3vPha2XOuw4",
            stream: true
        })

    for await (const event of stream) {
        if (event.event === "thread.message.delta") {
            if (event.data.delta.content[0].text.annotations) {
                eventStream.push('content: ' + event.data.delta.content[0].text.value.replace(/†source/g, "").replace(/【/g, "[").replace(/】/g, "]"))
                eventStream.send()
            } else {
                eventStream.push('content: ' + event.data.delta.content[0].text.value)
                eventStream.send()
            }
        }
    }
    return eventStream.send()
});
