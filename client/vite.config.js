import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ai-resume-job-matcher-1-0k1t.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
