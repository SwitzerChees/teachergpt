import Markdown from 'vue3-markdown-it'

export default defineNuxtPlugin((nuxtApp) => {
  const app = nuxtApp.vueApp
  app.component('Markdown', Markdown)
})
