import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@PagePrincipale': path.resolve(__dirname, 'src/PagePrincipale'),
    },
  },
});
