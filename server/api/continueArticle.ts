import OpenAI from 'openai';
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
    const eventStream = createEventStream(event)

    eventStream.push('info: Starting article writing process.')
    eventStream.onClosed(async () => {
        await eventStream.close()
    })

    const session = await getServerSession(event)
    const queryUrl = event.node.req.url
    const querystring = queryUrl.split('?')[1]
    const queryArgs = querystring.split('&')
    let query = {}
    queryArgs.forEach((arg) => {
        const [key, value] = arg.split('=')
        query[key] = decodeURIComponent(value)
    })

    let openaiApiKey = query.openaiApiKey;
    const threadId = query.threadId;
    const followUp = query.followUp;

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

    const message = await client.beta.threads.messages
        .create(threadId, {
            role: "user",
            content: followUp,
        });

    const stream = await client.beta.threads.runs
        .create(threadId, {
            assistant_id: "asst_t8CuPPNq4g2XO3vPha2XOuw4",
            stream: true
        })

    eventStream.push(`step: none`)
    eventStream.send();
    eventStream.push('content: ' + "\n \n # 🗣️ " + followUp + "\n")
    eventStream.send()



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
