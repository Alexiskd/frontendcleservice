import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'), // 👈 Alias for utils
    },
  },
  server: {
    preview: {
      allowedHosts: ['www.cleservice.com'], // Allow the specified host
    },
  }, // Make sure this closing brace is for the "server" configuration
}); // Make sure this is the last closing brace for "defineConfig"
