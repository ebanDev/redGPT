<script setup lang="ts">
import OpenAI from 'openai';

const apiKeysStore = useApiKeysStore();
const { apiKeys } = storeToRefs(apiKeysStore);

const query = useRoute().query.q
const results = ref([])
const article = ref("")

onMounted(async () => {
    try {
        if (typeof (query) === "string") {
            const { data: searchData } = await useFetch(`/api/search?query=${query}&summary=false&exaApiKey=${apiKeys.value.exa}`)
            results.value = searchData.value

            const sourceLinks = searchData.value.map(result => result.url)
            const { data: articleData } = await useFetch(`/api/generateArticle?query=${query}&sourceLinks=${sourceLinks}&openaiApiKey=${apiKeys.value.OpenAI}`)

            const client = new OpenAI({
                apiKey: apiKeys.value.OpenAI,
                dangerouslyAllowBrowser: true
            });


            const stream = await client.beta.threads.runs
                .create(articleData.value, {
                    assistant_id: "asst_t8CuPPNq4g2XO3vPha2XOuw4",
                    stream: true
                })

            for await (const event of stream) {
                console.log(event)
                if (event.event === "thread.message.delta") {
                    article.value += event.data.delta.content[0].text.value
                }
            }
        } else {
            navigateTo("/")
        }
    } catch (error) {
        console.error("An error occurred:", error)
    }
})
</script>


<template>
    <h1 class="text-4xl font-bold text-center text-gray-900 p-4">
        Results for: {{ query }}
    </h1>
    <div class="flex gap-4">
        <div class="flex flex-col gap-4 flex-wrap flex-align justify-center">
            <UCard v-for="result of results" class="w-80" v-if="results.length > 0">
                <template #header>
                    <h3 class="text-l font-bold">
                        {{ result.title.length > 50 ? result.title.substring(0, 50) + '...' : result.title }}
                    </h3>
                </template>
                <div class="flex flex-col gap-2">
                    <span>{{ new Date(result.publishedDate).toLocaleDateString('en-US', {
                        year: 'numeric', month:
                            'long', day: 'numeric'
                    }) }}</span>
                    <span>{{ result.url.match(/:\/\/(www\.)?(.[^/]+)/)[2] }}</span>
                </div>
            </UCard>
        </div>
        <div class="flex">
            <p>{{ article }}</p>
        </div>
    </div>
</template>