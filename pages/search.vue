<script setup lang="ts">
const apiKeysStore = useApiKeysStore();
const { apiKeys } = storeToRefs(apiKeysStore);

const query = useRoute().query.q
const results = ref([])

if (typeof (query) === "string") {
    const { data } = await useFetch(`/api/search?query=${query}&summary=true&exaApiKey=${apiKeys.value.exa}`)
    results.value = data.value
} else {
    navigateTo("/")
}

const search = () => {
    navigateTo('/search?q=' + query)
}
</script>

<template>
    <main class="container mx-auto p-4 max-w-4xl">
        <h1 class="text-5xl font-bold text-center mb-8">
            redGPT<span class="text-red-700 text-8xl">.</span>
        </h1>
        <div class="mb-4 flex gap-4 justify-center items-center flex-wrap sm:flex-nowrap">
            <UInput v-model="query" icon="i-tabler-world-search" class="w-full" />
            <UButton @click="navigateTo('/search?q=' + query)" icon="i-tabler-world-search">
                Search
            </UButton>
            <UButton @click="navigateTo('/article?q=' + query)" icon="i-tabler-article">
                Deep dive
            </UButton>
        </div>
        <div>
            <div v-for="result in results" :key="result.id" class="border-b py-4 flex gap-2 flex-col">
                <a :href="result.url" class="text-xl font-bold hover:underline">
                    {{ result.title }}
                </a>
                <p class="text-sm text-gray-600">
                    {{ new Date(result.publishedDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    }) }} - {{ result.author }} - {{ result.url.split('/')[2] }}
                </p>
                <p class="text-gray-800">
                    {{ result.summary }}
                </p>
            </div>
        </div>
    </main>
</template>