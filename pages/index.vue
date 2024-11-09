<script setup lang="ts">
import { LazySearchModal } from '#components';
import { LazyArticleModal } from '#components';
const query = ref<string>('');
</script>

<template>
    <main class="flex flex-col items-center justify-center h-screen gap-4 pb-8 max-w-96 mx-auto">
        <Header />
        <p class="pb-4">
            Search the web or deep dive into a topic with a materialist point of view.
        </p>
        <SearchBar :query="query" />
    </main>
</template>