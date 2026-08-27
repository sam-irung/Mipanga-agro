import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: {
      overlay: false,
    },
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    force: true,
    include: [
      'react-router-dom',
      'leaflet',
      'react-leaflet',
      '@react-leaflet/core',
    ],
  },
});
