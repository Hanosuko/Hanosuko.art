import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { musicManifestPlugin } from './vite-plugins/music-manifest'
import { tiersDevApiPlugin } from './vite-plugins/tiers-dev-api'

export default defineConfig({
  plugins: [vue(), musicManifestPlugin(), tiersDevApiPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
})
