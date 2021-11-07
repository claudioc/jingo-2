import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteAliases } from 'vite-aliases';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteAliases({
      useTypescript: true
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:6767',
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
});
