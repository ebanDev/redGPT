// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  ssr: false,
  modules: ['@nuxt/ui', '@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt'], 
  css: ['~/static/css/base.scss'],
})