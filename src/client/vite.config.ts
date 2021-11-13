import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteAliases } from 'vite-aliases';
import eslintPlugin from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      fastRefresh: false
    }),
    eslintPlugin({
      cache: false
    }),
    ViteAliases({
      useTypescript: true
    })
  ],
  server: {
    hmr: false,
    proxy: {
      '/api': {
        target: 'http://localhost:6767',
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
});
