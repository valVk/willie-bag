import { defineConfig } from '@vite-pwa/assets-generator/config'

// public/icon.svg already has its background and keeps the bag inside the maskable safe zone,
// so every size uses it as is. Regenerate with: npm run icons
export default defineConfig({
  preset: {
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[48, 'favicon.ico']],
      padding: 0
    },
    maskable: {
      sizes: [512],
      padding: 0
    },
    apple: {
      sizes: [180],
      padding: 0
    }
  },
  images: ['public/icon.svg']
})
