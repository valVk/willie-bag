import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import { VitePWA } from 'vite-plugin-pwa'

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
    }),
    VitePWA({
      // A new version waits until the app is reopened, so it never reloads during a drill.
      registerType: 'prompt',
      manifest: {
        name: 'Willie bag',
        short_name: 'Willie bag',
        description: "Calls out Cus D'Amato's punch numbers while you work the heavy bag.",
        lang: 'en',
        display: 'standalone',
        theme_color: '#4b1410',
        background_color: '#4b1410',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // The sounds are included so a drill works with no signal at the gym.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3}'],
        // English only needs the latin font files.
        globIgnores: ['**/*-{vietnamese,latin-ext}-*.woff2']
      }
    })
  ]
})
