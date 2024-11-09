<script lang="ts" setup>
const props = defineProps<{
  query: string
}>()

const userPrefs = useUserPrefsStore()
const searchQuery = ref('')
const isLoading = ref(false)
const modal = useModal()

onMounted(() => {
  searchQuery.value = props.query
})

const languages_list = ref([
  "Afrikaans",
  "Albanian - shqip",
  "Amharic - አማርኛ",
  "Arabic - العربية",
  "Aragonese - aragonés",
  "Armenian - հայերեն",
  "Asturian - asturianu",
  "Azerbaijani - azərbaycan dili",
  "Basque - euskara",
  "Belarusian - беларуская",
  "Bengali - বাংলা",
  "Bosnian - bosanski",
  "Breton - brezhoneg",
  "Bulgarian - български",
  "Catalan - català",
  "Central Kurdish - کوردی (دەستنوسی عەرەبی)",
  "Chinese - 中文",
  "Chinese (Hong Kong) - 中文（香港）",
  "Chinese (Simplified) - 中文（简体）",
  "Chinese (Traditional) - 中文（繁體）",
  "Corsican",
  "Croatian - hrvatski",
  "Czech - čeština",
  "Danish - dansk",
  "Dutch - Nederlands",
  "English",
  "Esperanto - esperanto",
  "Estonian - eesti",
  "Faroese - føroyskt",
  "Filipino",
  "Finnish - suomi",
  "French",
  "Galician - galego",
  "Georgian - ქართული",
  "German - Deutsch",
  "German (Austria) - Deutsch (Österreich)",
  "German (Germany) - Deutsch (Deutschland)",
  "German (Liechtenstein) - Deutsch (Liechtenstein)",
  "German (Switzerland) - Deutsch (Schweiz)",
  "Greek - Ελληνικά",
  "Guarani",
  "Gujarati - ગુજરાતી",
  "Hausa",
  "Hawaiian - ʻŌlelo Hawaiʻi",
  "Hebrew - עברית",
  "Hindi - हिन्दी",
  "Hungarian - magyar",
  "Icelandic - íslenska",
  "Indonesian - Indonesia",
  "Interlingua",
  "Irish - Gaeilge",
  "Italian - italiano",
  "Italian (Italy) - italiano (Italia)",
  "Italian (Switzerland) - italiano (Svizzera)",
  "Japanese - 日本語",
  "Kannada - ಕನ್ನಡ",
  "Kazakh - қазақ тілі",
  "Khmer - ខ្មែរ",
  "Korean - 한국어",
  "Kurdish - Kurdî",
  "Kyrgyz - кыргызча",
  "Lao - ລາວ",
  "Latin",
  "Latvian - latviešu",
  "Lingala - lingála",
  "Lithuanian - lietuvių",
  "Macedonian - македонски",
  "Malay - Bahasa Melayu",
  "Malayalam - മലയാളം",
  "Maltese - Malti",
  "Marathi - मराठी",
  "Mongolian - монгол",
  "Nepali - नेपाली",
  "Norwegian - norsk",
  "Norwegian Bokmål - norsk bokmål",
  "Norwegian Nynorsk - nynorsk",
  "Occitan",
  "Oriya - ଓଡ଼ିଆ",
  "Oromo - Oromoo",
  "Pashto - پښتو",
  "Persian - فارسی",
  "Polish - polski",
  "Portuguese - português",
  "Portuguese (Brazil) - português (Brasil)",
  "Portuguese (Portugal) - português (Portugal)",
  "Punjabi - ਪੰਜਾਬੀ",
  "Quechua",
  "Romanian - română",
  "Romanian (Moldova) - română (Moldova)",
  "Romansh - rumantsch",
  "Russian - русский",
  "Scottish Gaelic",
  "Serbian - српски",
  "Serbo - Croatian",
  "Shona - chiShona",
  "Sindhi",
  "Sinhala - සිංහල",
  "Slovak - slovenčina",
  "Slovenian - slovenščina",
  "Somali - Soomaali",
  "Southern Sotho",
  "Spanish - español",
  "Spanish (Argentina) - español (Argentina)",
  "Spanish (Latin America) - español (Latinoamérica)",
  "Spanish (Mexico) - español (México)",
  "Spanish (Spain) - español (España)",
  "Spanish (United States) - español (Estados Unidos)",
  "Sundanese",
  "Swahili - Kiswahili",
  "Swedish - svenska",
  "Tajik - тоҷикӣ",
  "Tamil - தமிழ்",
  "Tatar",
  "Telugu - తెలుగు",
  "Thai - ไทย",
  "Tigrinya - ትግርኛ",
  "Tongan - lea fakatonga",
  "Turkish - Türkçe",
  "Turkmen",
  "Twi",
  "Ukrainian - українська",
  "Urdu - اردو",
  "Uyghur",
  "Uzbek - o‘zbek",
  "Vietnamese - Tiếng Việt",
  "Walloon - wa",
  "Welsh - Cymraeg",
  "Western Frisian",
  "Xhosa",
  "Yiddish",
  "Yoruba - Èdè Yorùbá",
  "Zulu - isiZulu"
]);


const article_lengths = ref([
  {
    label: "Short",
    value: "short",
    icon: 'i-lucide-file-text'
  },
  {
    label: "Medium",
    value: "medium",
    icon: 'i-lucide-newspaper',
  },
  {
    label: "Long",
    value: "long",
    icon: 'i-lucide-book',
  }
]);

const navigateToArticle = async () => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      await navigateTo('/article?q=' + searchQuery.value + '&searchLang=' + userPrefs.language + '&articleLang=' + userPrefs.articleLanguage + '&articleLength=' + userPrefs.articleLength)
      modal.close()
      resolve()
    } catch (error) {
      reject(error)
    } finally {
    }
  })
}
</script>

<template>
  <UModal title="Deep dive" close-icon="i-tabler-x">
    <template #body>
      <div class="flex flex-col gap-4">
        <h3 class="text-xl font-bold">
          Search settings
        </h3>
        <UFormField label="Query" description="Your search query" class="w-full">
          <UInput icon="i-tabler-search" v-model="searchQuery" placeholder="Genesis of the modern State"
            class="w-full" />
        </UFormField>
        <UFormField label="Languages" description="List of languages allowed in the search results" class="w-full">
          <UInputMenu icon="i-tabler-language" v-model="userPrefs.searchLanguage" multiple="true" :items="languages_list"
            class="w-full" />
        </UFormField>
      </div>
      <USeparator class="my-4" />
      <div class="flex flex-col gap-4">
        <h3 class="text-xl font-bold">
          Article settings
        </h3>
        <UFormField label="Article length" description="The length of the article to be written" class="w-full">
          <UTabs v-model="userPrefs.articleLength" :content="false" :items="article_lengths" class="w-full" />
        </UFormField>
        <UFormField label="Article language" description="The language of the article to be written" class="w-full">
          <UInputMenu icon="i-tabler-language" v-model="userPrefs.articleLanguage" :items="languages_list"
            class="w-full" />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex gap-4">
        <UButton loading-auto @click="navigateToArticle" icon="i-tabler-article">
          Deep dive
        </UButton>
      </div>
    </template>
  </UModal>
</template>
<style></style>
