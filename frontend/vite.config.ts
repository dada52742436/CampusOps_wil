import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // proxy 的作用：前端发给 /api/... 的请求，Vite 开发服务器自动转发给后端
    // 这样前端代码写 axios.post('/api/auth/login') 就可以，不需要写完整后端地址
    // 同时彻底解决开发阶段的 CORS 跨域问题
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
