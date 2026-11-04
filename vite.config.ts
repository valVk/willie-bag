import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'

export default defineConfig({
  // GitHub Pages serves the app from /<repo>/; the Pages workflow sets BASE_PATH. Local dev stays at /.
  base: process.env.BASE_PATH || '/',
  plugins: [
    vue(),
    ui({
      router: false,
      colorMode: false,
      ui: {
        colors: {
          primary: 'tape',
          neutral: 'stone'
        }
      }
    })
  ]
})
