import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import path from 'path'

const pathSrc = fileURLToPath(new URL('./src', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  base: '/Vue3-BigEvent-AdminSys/',
  plugins: [
    vue(),
    // vueDevTools(), // 按需启用：需要 Vue DevTools 调试时取消注释
    AutoImport({
      imports: ['vue'],
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({ 
          prefix: 'Icon' 
        })
      ],
      dts: path.resolve(pathSrc, 'auto-imports.d.ts')
    }),
    Components({
      resolvers: [
        IconsResolver({ 
          enabledCollections: ['ep'] 
        }),
        ElementPlusResolver()
      ],
      dts: path.resolve(pathSrc, 'components.d.ts')
    }),
    Icons({
      autoInstall: true,
    }),
    vueDevTools()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://big-event-vue-api-t.itheima.net',
        changeOrigin: true,
      },
      '/my': {
        target: 'https://big-event-vue-api-t.itheima.net',
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: 'https://big-event-vue-api-t.itheima.net',
        changeOrigin: true,
      },
      '/my': {
        target: 'https://big-event-vue-api-t.itheima.net',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
