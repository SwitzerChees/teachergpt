import PrimeVue from 'primevue/config'

import ToastService from 'primevue/toastservice'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Skeleton from 'primevue/skeleton'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

export default defineNuxtPlugin((nuxtApp) => {
  const app = nuxtApp.vueApp
  app.use(PrimeVue, { ripple: true })

  // components
  app.component('Button', Button)
  app.component('InputText', InputText)
  app.component('TabView', TabView)
  app.component('TabPanel', TabPanel)
  app.component('Skeleton', Skeleton)
  app.component('DataTable', DataTable)
  app.component('Column', Column)

  // services
  app.use(ToastService)
})
