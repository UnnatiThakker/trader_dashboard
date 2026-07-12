import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 4174,
    strictPort: true,
    proxy: {
      '/remote': {
        target: 'http://127.0.0.1:4175',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/remote/, ''),
      },
    },
  },
  plugins: [
    react(),
    federation({
      remotes: {
        remoteApp: '/remote/assets/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^19.2.7',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.2.7',
        },
      },
    }),
  ],
})
