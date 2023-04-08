import PrimeVue from 'primevue/config'

import ToastService from 'primevue/toastservice'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

export default defineNuxtPlugin((nuxtApp) => {
  const app = nuxtApp.vueApp
  app.use(PrimeVue, { ripple: true })

  // components
  app.component('Button', Button)
  app.component('InputText', InputText)

  // services
  app.use(ToastService)
})
