import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    mode === 'development' && vueDevTools(), // dev-only
  ].filter(Boolean),
  base: '/', // tu app vive en chasquisante.smartpx.org (raíz)
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Descomenta solo si usas `template:` en JS/TS:
       'vue': 'vue/dist/vue.esm-bundler.js',
    },
  },
  build: {
    sourcemap: false,
  },
}))
