// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  ssr: false,
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxt/fonts',
    '@sidebase/nuxt-auth',
  ],

  auth: {
    isEnabled: true,
    provider: {
      type: 'authjs',
      defaultProvider: 'google',
    },
  },

  nitro: {
    experimental: {
      websocket: true
    },
  }
})