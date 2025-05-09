import './assets/main.css'

import { createApp } from 'vue'

// import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' //引入持久化插件
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
const pinia=createPinia()
const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)

app.mount('#app')
