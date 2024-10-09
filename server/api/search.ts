import Exa from 'exa-js';

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const searchQuery = query.query
    const showSummary = query.summary == "true"
    const exaApiKey = query.exaApiKey

    if (!exaApiKey) {
        return `No API Key provided`
    }

    const exa = new Exa(exaApiKey);
    let results;
    if (showSummary) {
        results = await exa.searchAndContents(
             "In a marxist/anarchist point of view, give me some links of articles, books about:" + searchQuery,
             {
                 type: "neural",
                 useAutoprompt: true,
                 numResults: 10,
                 summary: {
                     query: "What does this link cover?"
                 },
             }
         );

    } else {
        results = await exa.search(
            "In a marxist/anarchist point of view, give me some links of articles, books about:" + searchQuery,
            {
                type: "neural",
                useAutoprompt: true,
                numResults: 10,
            }
        );
    }

    return results.results
})