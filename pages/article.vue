<script setup lang="ts">
import OpenAI from 'openai';
import VueMarkdown from 'vue-markdown-render';

const toast = useToast()

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
            const { data: searchData } = await useFetch(`/api/search?query=${query}&summary=false&exaApiKey=${apiKeys.value.exa}&lang=${useRoute().query.searchLang}`)
            results.value = searchData.value

            currentAnimationStep.value = "text"
            const sourceLinks = searchData.value.map(result => encodeURIComponent(result.url))
            const eventSource = new EventSource('http://localhost:3000/api/generateArticle?query=' + query + '&sourceLinks=' + sourceLinks + '&openaiApiKey=' + apiKeys.value.OpenAI + '&lang=' + useRoute().query.articleLang + '&length=' + useRoute().query.articleLength)

            eventSource.onmessage = (event) => {
                const eventType = event.data.split(": ")[0]
                const eventData = event.data.split(": ")[1]

                if (eventType === "info") {
                    toast.add({
                        title: event.data,
                    })
                } else if (eventType === "content") {
                    if (eventData.startsWith("#")) {
                        article.value += "\n"
                    }
                    article.value += eventData
                    if (eventData === "") {
                        article.value += "\n"
                    }
                } else if (eventType === "step") {
                    currentAnimationStep.value = eventData
                } else if (eventType === "threadId") {
                    threadId.value = eventData
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

    const eventSource = new EventSource('http://localhost:3000/api/continueArticle?threadId=' + threadId.value + '&openaiApiKey=' + apiKeys.value.OpenAI + '&followUp=' + followUpQuery.value)

    eventSource.onmessage = (event) => {
        const eventType = event.data.split(": ")[0]
        const eventData = event.data.split(": ")[1]

        if (eventType === "info") {
            toast.add({
                title: event.data,
            })
        } else if (eventType === "content") {
            if (eventData.startsWith("#")) {
                article.value += "\n"
            }
            article.value += eventData
            if (eventData === "") {
                article.value += "\n"
            }
        } else if (eventType === "step") {
            currentAnimationStep.value = eventData
        }
    }
}
</script>

<template>
    <main class="container mx-auto p-4 max-w-4xl">
        <Header />
        <SearchBar :query="query" :inline="true" />
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-1 mt-8">
            <UIcon name="i-tabler-link" /> Sources
        </h2>
        <div class="flex gap-4 p-1 overflow-x-scroll">
            <UCard v-for="result in results" :key="result.id" class="w-64 shrink-0 flex flex-col justify-between"
                v-if="results.length > 0">
                <a :href="result.url" class="text-base font-bold hover:underline line-clamp-2 mb-auto">
                    {{ result.title }}
                </a>
                <p class="text-sm text-gray-600 mt-auto h-max text-wrap">
                    {{ result.author }} <br> {{ result.url.split('/')[2] }}
                </p>
            </UCard>
            <UCard v-for="n in 10" :key="n" class="w-64 h-32 shrink-0 flex flex-col justify-between"
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