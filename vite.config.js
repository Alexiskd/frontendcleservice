// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Si Render construit votre code dans /opt/render/project/src/src/ :
      '@utils': path.resolve(__dirname, 'src/utils'),
      // Sinon, si vos fichiers sources sont directement dans /opt/render/project/src/ (sans dossier interne "src"):
      // '@utils': path.resolve(__dirname, 'utils'),
    },
  },
});
