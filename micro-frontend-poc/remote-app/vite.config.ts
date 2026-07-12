import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 4175,
    strictPort: true,
  },
  build: {
    target: 'esnext',
    minify: false,
  },
  plugins: [
    react(),
    federation({
      name: 'remoteApp',
      filename: 'remoteEntry.js',
      exposes: {
        './RemoteWidget': './src/RemoteWidget.tsx',
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
