// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ici, nous supposons que vos sources se trouvent dans le dossier interne "src"
      // et que preloadData.js se trouve dans "src/utils"
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
});
