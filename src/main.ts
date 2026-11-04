import { createApp } from 'vue'
import ui from '@nuxt/ui/vue-plugin'
import '@fontsource/alfa-slab-one'
import '@fontsource/barlow-semi-condensed/500.css'
import '@fontsource/barlow-semi-condensed/600.css'
import './main.css'
import App from './App.vue'

createApp(App).use(ui).mount('#app')
