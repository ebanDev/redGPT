<script setup lang="ts">
const apiKeysStore = useApiKeysStore();
const { apiKeys, apiKeysUnset } = storeToRefs(apiKeysStore);

const query = ref<string>('');
</script>

<template>
    <UModal v-model="apiKeysUnset">
        <div class="p-4 flex flex-col gap-4">
            <UFormGroup label="OpenAI">
                <UInput v-model="apiKeys.OpenAI" placeholder="sk-feaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    icon="i-tabler-brand-openai" />
            </UFormGroup>
            <UFormGroup label="ExaAI">
                <UInput v-model="apiKeys.exa" placeholder="xxxxxxxxxxxxxxxxxxxxxxxx" icon="i-tabler-world-search" />
            </UFormGroup>
            <UButton @click="apiKeysUnset = false" class="w-max">
                Save
            </UButton>
        </div>
    </UModal>

    <main class="flex flex-col items-center justify-center h-screen gap-4 pb-8 max-w-96 mx-auto">
        <h1 class="text-5xl font-bold text-center">
            redGPT<span class="text-red-700 text-8xl">.</span>
        </h1>
        <p class="pb-4">
            Search the web or deep dive into a topic with a socialist point of view. 
        </p>
        <UInput v-model="query" icon="i-tabler-search" placeholder="Genesis of the modern State" />
        <div class="flex gap-4">
            <UButton @click="navigateTo('/search?q=' + query)" class="mt-4" icon="i-tabler-world-search">
            Search
        </UButton>
        <UButton @click="navigateTo('/article?q=' + query)" class="mt-4" icon="i-tabler-article">
            Deep dive
        </UButton>
        </div>
    </main>
</template>