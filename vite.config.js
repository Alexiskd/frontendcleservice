// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Option 1 : Si vos sources sont dans un dossier interne "src" et preloadData.js se trouve dans "src/utils"
      '@utils': path.resolve(__dirname, 'src/utils'),
      
      // Option 2 : Si vos sources sont directement dans /src/ (sans dossier interne)
      // '@utils': path.resolve(__dirname, 'utils'),
    },
  },
});
