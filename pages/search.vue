<script setup lang="ts">
const apiKeysStore = useApiKeysStore();
const { apiKeys } = storeToRefs(apiKeysStore);

const query = useRoute().query.q
const results = ref([])

if (typeof (query) === "string") {
    const { data } = await useAsyncData(() => $fetch(`/api/search?query=${query}&summary=true&exaApiKey=${apiKeys.value.exa}&lang=${useRoute().query.lang}`))
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
        <Header />
        <SearchBar :query="query" :inline="true" />
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