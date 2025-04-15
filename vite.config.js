import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    // On autorise le domaine "frontendcleservice.onrender.com"
    allowedHosts: ['frontendcleservice.onrender.com']
  },
});
