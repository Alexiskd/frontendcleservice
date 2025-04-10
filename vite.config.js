import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ici, on indique que l'alias "@utils" pointe vers le dossier "src/utils"
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
});
