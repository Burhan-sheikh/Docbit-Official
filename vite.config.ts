import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,txt,xml}'],

          navigateFallbackDenylist: [
            /^\/sitemap\.xml$/,
            /^\/sitemap-pages\.xml$/,
            /^\/sitemap-tools\.xml$/,
            /^\/robots\.txt$/,
          ],
        },
        manifest: {
          name: 'DocBit - Free PDF Tools',
          short_name: 'DocBit',
          description: 'Secure, browser-based PDF tools. Fast, private local file processing with no server uploads.',
          theme_color: '#2563eb',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'any',
          icons: [
            {
              src: 'https://res.cloudinary.com/dlesei0kn/image/upload/v1778091387/siteiconmain_jfmywn.jpg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'any'
            },
            {
              src: 'https://res.cloudinary.com/dlesei0kn/image/upload/v1778091387/siteiconmain_jfmywn.jpg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});