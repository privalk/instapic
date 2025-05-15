import { fileURLToPath, URL } from 'node:url'
import comlink from 'vite-plugin-comlink';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import vuetify from 'vite-plugin-vuetify'
import electron from 'vite-plugin-electron/simple'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    comlink(),
    vuetify({
      styles: { configFile: 'src/scss/vuetify.scss' } // 指定 SASS 配置文件
    }),
    // electron({
    //   main: {
    //     entry: 'electron/main.ts',
    //   },
    //   preload: {
    //     input: 'electron/preload.ts',
    //   },
    // }),
  ],
  worker: {
    plugins: () => [comlink()]
  },
  server: {
    host: '0.0.0.0'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
