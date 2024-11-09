import Exa from 'exa-js';
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    const query = getQuery(event)

    const searchQuery = query.query
    const searchLanguage = query.lang.replace(/,/g, ' or ')
    console.log("searchQuery", query.lang)
    const showSummary = query.summary == "true"
    let exaApiKey = query.exaApiKey

    if (!exaApiKey) {
        if (!session) {
            return { status: 'unauthenticated!' }
        } else {
            exaApiKey = process.env.EXA_API_KEY;
        }
    }

    const exa = new Exa(exaApiKey);
    let results;
    if (showSummary) {
        results = await exa.searchAndContents(
             "Here is an article/book from a materialist/marxist persective on " + searchQuery + " in " + searchLanguage,
             {
                 type: "neural",
                 useAutoprompt: false,
                 numResults: 10,
                 summary: {
                     query: "What does this link cover? Answer in the language of the original content.",
                 },
             }
         );

    } else {
        results = await exa.search(
            "In a marxist/anarchist point of view, give me some links of articles, books about:" + searchQuery + " in language(s) : " + searchLanguage,
            {
                type: "neural",
                useAutoprompt: true,
                numResults: 10,
            }
        );
    }

    return results.results
})