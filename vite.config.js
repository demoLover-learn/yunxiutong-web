import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  //配置axios代理
  server:{
    proxy:{
      '/api':{
        target:'http://localhost:8080',
        //在Vite开发服务器代理请求时，自动将请求头（Header）中的 Host 字段，
        // 修改为你配置的 target 地址的主机名。
        changeOrigin:true,
      },
      // 后端把上传目录映射在 /uploads/**，这里要带 s
      '/uploads':{
        target:'http://localhost:8080',
        changeOrigin:true,
      }
    }
  }

})
