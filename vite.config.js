import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@api': path.resolve(__dirname, 'src/api'),
      '@utils': path.resolve(__dirname, 'src/utils'), // Ajout de l'alias pour @utils
      // … vos autres alias
    }
  },
  preview: {
    // autorise explicitement ce host lors d'un `vite preview`
    allowedHosts: ['www.cleservice.com']
  },
  build: {
    rollupOptions: {
      external: ['@utils/preloadData.js'], // Optionnel, si vous souhaitez externaliser ce module
    }
  }
});
