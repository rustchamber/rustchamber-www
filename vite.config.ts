import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const IMAGE_ORIGIN = 'https://rustchamber.lipecode.com'
const proxy = {
  '/img': { target: IMAGE_ORIGIN, changeOrigin: true },
}

export default defineConfig({
  base: './',
  plugins: [svelte(), tailwindcss()],
  server: { proxy },
  preview: { proxy },
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        download: 'download/index.html',
        support: 'support/index.html',
        privacy: 'privacy/index.html',
        roadmap: 'roadmap/index.html',
      },
    },
  },
})
