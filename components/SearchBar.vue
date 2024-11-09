<script setup>
import { LazyArticleModal, LazySearchModal } from '#components';

const props = defineProps({
    query: {
        type: String,
        required: true
    },
    inline: {
        type: Boolean,
        default: false
    }
})

const userQuery = ref('')
userQuery.value = props.query

const modal = useModal()
const openSearchModal = () => {
    modal.open(LazySearchModal, {
        query: userQuery.value
    })
}

const openArticleModal = () => {
    modal.open(LazyArticleModal, {
        query: userQuery.value
    })
}
</script>

<template>
    <div :class="['mb-4', 'flex', 'gap-4', 'justify-center', 'items-center', { 'flex-wrap': !inline, 'flex-nowrap': inline }]">
        <UInput v-model="userQuery" icon="i-tabler-search" class="w-full" />
        <UButton @click="openSearchModal()" class="w-max text-nowrap" icon="i-tabler-world-search">
            Search
        </UButton>
        <UButton @click="openArticleModal()" class="w-max text-nowrap" icon="i-tabler-article">
            Deep dive
        </UButton>
    </div>
    <SearchModal />
    <ArticleModal />
</template>
