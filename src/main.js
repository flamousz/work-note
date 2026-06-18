import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.p-dark'
    }
  }
})

// Dynamically set dark mode for PrimeVue components
document.documentElement.classList.add('p-dark')

app.mount('#app')

