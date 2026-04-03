import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver({ importStyle: 'css' })],
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: 'css' })],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('xlsx')) {
            return 'xlsx'
          }

          if (id.includes('echarts')) {
            return 'echarts'
          }

          if (id.includes('@vue') || id.includes('vue-router') || id.includes('pinia') || id.includes('/vue/')) {
            return 'vue-vendor'
          }

          if (id.includes('@element-plus/icons-vue')) {
            return 'element-plus-icons'
          }

          if (id.includes('@floating-ui') || id.includes('@popperjs')) {
            return 'floating-ui'
          }

          if (id.includes('dayjs') || id.includes('async-validator')) {
            return 'element-plus-deps'
          }

          if (id.includes('element-plus') || id.includes('@element-plus')) {
            return 'element-plus'
          }

          if (id.includes('axios') || id.includes('nprogress')) {
            return 'request-vendor'
          }

          return 'vendor'
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/variables.scss" as *;`,
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import'],
      }
    }
  }
})
