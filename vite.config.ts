import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/nightstudy': {
        target: 'https://dodam-api.b1nd.com',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
      },
      '/auth': {
        target: 'https://dodam-api.b1nd.com',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
      },
      '/user': {
        target: 'https://dodam-api.b1nd.com',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
      },
    }
  }
})