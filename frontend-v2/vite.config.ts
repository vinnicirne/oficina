import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-oficina.png'],
      manifest: {
        name: 'OSS Manutenção & Serviços',
        short_name: 'OSS',
        description: 'Gestão Inteligente para sua Oficina',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        display: 'standalone',
        icons: [
          {
            src: '/logo-oficina.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-oficina.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true
      }
    })
  ],
})
