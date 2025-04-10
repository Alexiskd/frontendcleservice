// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Ici, on considère que vos fichiers sources sont dans le dossier interne "src"
// et preloadData.js se trouve dans "src/utils" (donc, le chemin complet sera /opt/render/project/src/src/utils/preloadData.js)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
});
