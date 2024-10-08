<script setup lang="ts">
const apiKeysStore = useApiKeysStore();
const { apiKeys } = storeToRefs(apiKeysStore);

const query = useRoute().query.q
const results = ref([])

if (typeof(query) === "string") {
    const { data } = await useFetch(`/api/search?query=${query}&summary=true&exaApiKey=${apiKeys.value.exa}`)
    results.value = data.value
} else {
    navigateTo("/")
}
</script>

<template>
    <h1 class="text-4xl font-bold text-center text-gray-900">
        Results for: {{ query }}
    </h1>
    <div class="flex gap-8 flex-wrap flex-align justify-center">
        <UCard v-for="result of results" class="w-1/4">
            <template #header>
                <h2 class="text-xl font-bold">
                    {{ result.title }}
                </h2>
            </template>
            <p>
                {{ result.summary }}
            </p>
            <template #footer>
                <div class="flex gap-2">
                    <span>{{ new Date(result.publishedDate).toLocaleDateString('en-US', {
                        year: 'numeric', month:
                            'long', day: 'numeric'
                    }) }}</span>
                    <span>{{ result.author }}</span>
                </div>
            </template>
        </UCard>
    </div>
</template>