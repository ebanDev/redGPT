export const useApiKeysStore = defineStore('apiKeys', () => {
    const apiKeys = ref({
        OpenAI: '',
        exa: '',
    });

    const apiKeysUnset = ref(true);

    return {
        apiKeys,
        apiKeysUnset
    };
}, {
    persist: true,
});