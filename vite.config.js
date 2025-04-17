import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // now you can do import { ... } from '@api/brandsApi'
      '@api': path.resolve(__dirname, 'src/api'),
      // (optional) also make @/ point at src/
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
});
