import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { musicManifestPlugin } from './vite-plugins/music-manifest'
import { cistiersDevApiPlugin } from './vite-plugins/cistiers-dev-api'
import { serverStatusDevApiPlugin } from './vite-plugins/server-status-dev-api'
import { ogImagePlugin } from './vite-plugins/og-image'

export default defineConfig({
  plugins: [vue(), musicManifestPlugin(), cistiersDevApiPlugin(), serverStatusDevApiPlugin(), ogImagePlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
  },
})
