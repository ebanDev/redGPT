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

    <main class="flex flex-col items-center justify-center h-screen gap-4">
        <h1 class="text-4xl font-bold text-center text-gray-900">
            redGPT
        </h1>
        <UInput v-model="query" />
        <UButton @click="navigateTo('/search?q=' + query)" class="mt-4">
            Search
        </UButton>
        <UButton @click="navigateTo('/article?q=' + query)" class="mt-4">
            Read
        </UButton>
    </main>
</template>