const THIRTY_DAYS = 30 * 24 * 60 * 60

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['primevue/resources/primevue.min.css', 'primeicons/primeicons.css', 'assets/css/fonts.css', 'assets/css/theme.css'],
  runtimeConfig: {
    strapi: {
      url: 'http://0.0.0.0:1337',
    },
    staticToken: process.env.STATIC_TOKEN || '',
    public: {
      baseUrl: 'http://localhost:3000',
      strapi: {
        url: 'http://localhost:1337',
      },
    },
  },
  build: {
    transpile: ['primevue'],
  },
  modules: [
    '@nuxtjs/tailwindcss', // https://tailwindcss.nuxtjs.org/
    '@pinia/nuxt', // https://pinia.vuejs.org/
    '@nuxtjs/color-mode', // https://color-mode.nuxtjs.org/
    'nuxt-icon', // https://icones.js.org/
    '@nuxtjs/strapi', // https://strapi.nuxtjs.org/
  ],
  colorMode: {
    preference: 'system',
    dataValue: 'theme',
    classSuffix: '',
  },
  strapi: {
    cookie: {
      maxAge: THIRTY_DAYS,
    },
  },
})
