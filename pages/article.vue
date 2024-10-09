<script setup lang="ts">
import OpenAI from 'openai';
import VueMarkdown from 'vue-markdown-render';

const apiKeysStore = useApiKeysStore();
const { apiKeys } = storeToRefs(apiKeysStore);

const query = useRoute().query.q
const results = ref([])
const article = ref("")
const currentAnimationStep = ref("none")
const followUpQuery = ref("")
const threadId = ref("")

onMounted(async () => {
    try {
        if (typeof (query) === "string") {

            currentAnimationStep.value = "search"
            const { data: searchData } = await useFetch(`/api/search?query=${query}&summary=false&exaApiKey=${apiKeys.value.exa}`)
            results.value = searchData.value

            currentAnimationStep.value = "text"
            const sourceLinks = searchData.value.map(result => encodeURIComponent(result.url))
            const { data: articleData } = await useFetch(`/api/generateArticle?query=${query}&sourceLinks=${sourceLinks}&openaiApiKey=${apiKeys.value.OpenAI}`)
            threadId.value = articleData.value
            const client = new OpenAI({
                apiKey: apiKeys.value.OpenAI,
                dangerouslyAllowBrowser: true
            });


            const stream = await client.beta.threads.runs
                .create(threadId.value, {
                    assistant_id: "asst_t8CuPPNq4g2XO3vPha2XOuw4",
                    stream: true
                })

            currentAnimationStep.value = "none"

            for await (const event of stream) {
                console.log(event)
                if (event.event === "thread.message.delta") {
                    if (event.data.delta.content[0].text.annotations) {
                        article.value += event.data.delta.content[0].text.value.replace(/†source/g, "").replace(/【/g, "[").replace(/】/g, "]")
                    } else {
                        article.value += event.data.delta.content[0].text.value
                    }
                }
            }
        } else {
            navigateTo("/")
        }
    } catch (error) {
        console.error("An error occurred:", error)
    }
})

const submitFollowUp = async () => {
    currentAnimationStep.value = "text"

    const client = new OpenAI({
        apiKey: apiKeys.value.OpenAI,
        dangerouslyAllowBrowser: true
    });

    const message = await client.beta.threads.messages
        .create(threadId.value, {
            role: "user",
            content: followUpQuery.value,
        });

    const stream = await client.beta.threads.runs
        .create(threadId.value, {
            assistant_id: "asst_t8CuPPNq4g2XO3vPha2XOuw4",
            stream: true
        })

    article.value += "\n \n # 🗣️ " + followUpQuery.value + "\n"
    currentAnimationStep.value = "none"

    for await (const event of stream) {
        if (event.event === "thread.message.delta") {
            if (event.data.delta.content[0].text.annotations) {
                article.value += event.data.delta.content[0].text.value.replace(/†source/g, "").replace(/【/g, "[").replace(/】/g, "]")
            } else {
                article.value += event.data.delta.content[0].text.value
            }
        }
    }

    followUpQuery.value = ""
}
</script>

<template>
    <main class="container mx-auto p-4 max-w-4xl">
        <h1 class="text-5xl font-bold text-center mb-8">
            redGPT<span class="text-red-700 text-8xl">.</span>
        </h1>
        <div class="mb-4 flex gap-4 justify-center items-center flex-wrap sm:flex-nowrap">
            <UInput v-model="query" icon="i-tabler-search" class="w-full" />
            <UButton @click="navigateTo('/search?q=' + query)" icon="i-tabler-world-search">
                Search
            </UButton>
            <UButton @click="navigateTo('/article?q=' + query)" icon="i-tabler-article">
                Deep dive
            </UButton>
        </div>
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-1 mt-8">
            <UIcon name="i-tabler-link" /> Sources
        </h2>
        <div class="flex gap-4 p-1 overflow-x-scroll">
            <UCard v-for="result in results" :key="result.id" class="w-64 flex-shrink-0 flex flex-col justify-between"
                v-if="results.length > 0">
                <a :href="result.url" class="text-base font-bold hover:underline line-clamp-2 mb-auto">
                    {{ result.title }}
                </a>
                <p class="text-sm text-gray-600 mt-auto h-max">
                    {{ result.author }} <br> {{ result.url.split('/')[2] }}
                </p>
            </UCard>
            <UCard v-for="n in 10" :key="n" class="w-64 h-32 flex-shrink-0 flex flex-col justify-between"
                v-if="results.length === 0">
                <writing-animation class="h-20" currentStep="search" />
            </UCard>
        </div>
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-1 mt-8">
            <UIcon name="i-tabler-article" /> Answer
        </h2>

        <p class="rounded-lg p-6 bg-white shadow ring-1 ring-gray-200 whitespace-pre-wrap"
            v-if="currentAnimationStep == 'text'">
            <writing-animation class="h-28 my-32" currentStep="text" />
        </p>
        <p class="rounded-lg p-6 bg-white shadow ring-1 ring-gray-200 whitespace-pre-wrap" v-else>
            <VueMarkdown class="vue-markdown" :source="article" />
        </p>
        <div class="mt-8">
            <h2 class="text-2xl font-bold mb-4 flex items-center gap-1">
                <UIcon name="i-tabler-help" /> Ask a Follow-up
            </h2>
            <div class="flex gap-4">
                <UInput v-model="followUpQuery" placeholder="Type your follow-up question here..." class="w-full" />
                <UButton @click="submitFollowUp" icon="i-tabler-send">
                    Submit
                </UButton>
            </div>
        </div>
    </main>
</template>

<style lang="scss">
.vue-markdown {
    h1 {
        font-size: 1.5rem !important;
        font-weight: 900;
    }

    h2 {
        font-size: 1.3rem !important;
        font-weight: 800;
    }

    h3 {
        font-size: 1.2rem !important;
        font-weight: 700;
    }

    h4 {
        font-size: 1.1rem !important;
        font-weight: 600;
    }
}
</style>