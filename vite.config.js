import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    hmr: {
      host: '127.0.0.1',
      protocol: 'ws',
    },
    proxy: {
      '/api/google-script': {
        target: 'https://script.google.com',
        changeOrigin: true,
        secure: false,
        rewrite: () => '/macros/s/AKfycbwJ_JhCJgLOwHdMQ4rcwF5WBPaCMAAzF4_2ZazytK-swBUwo_01wcYgzTBWtmc4RRSq/exec',
      },
    },
  },
})
