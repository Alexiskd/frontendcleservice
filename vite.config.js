import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@api': path.resolve(__dirname, 'src/api'),
      // … vos autres alias
    }
  },
  preview: {
    // autorise explicitement ce host lors d'un `vite preview`
    allowedHosts: ['www.cleservice.com']
  }
});
