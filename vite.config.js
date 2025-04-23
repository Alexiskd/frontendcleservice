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
    // Add the allowedHosts setting here under the "server" configuration
    allowedHosts: ['www.cleservice.com'], // Allow the specified host
  },
});
