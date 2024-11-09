export const useUserPrefsStore = defineStore('userPrefs', () => {
    const searchLanguage = ref(["English"]);
    const articleLanguage = ref("English");
    const articleLength = ref("short");


    return {
        searchLanguage,
        articleLanguage,
        articleLength,
    };
}, {
    persist: true,
});