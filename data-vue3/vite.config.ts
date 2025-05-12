import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

// 自动导入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // http://localhost:5173/api/bar
      //   -> http://localhost8080/bar
      '/api': {
        target: loadEnv('', process.cwd()).VITE_API_URL, //import.meta.env.VITE_API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      // global imports to register
      imports: [
        // presets
        'vue',
        'vue-router',
      ],
      resolvers: [
        ElementPlusResolver(),
        // Auto import icon components
        // 自动导入图标组件
        IconsResolver(),
      ],
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        // Auto register icon components
        // 自动注册图标组件
        IconsResolver({
          enabledCollections: ['ep'],
        }),
      ],
    }),
    Icons({
      autoInstall: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
