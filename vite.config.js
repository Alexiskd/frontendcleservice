import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['jquery']
    }
  },
  preview: {
    allowedHosts: ['frontendcleservice.onrender.com']
  }
});
