// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ici, l'alias "@utils" pointe vers "src/utils"
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
});
