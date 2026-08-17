import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  base: './',
  plugins: [react(), basicSsl()],
  server: {
    host: true,
    proxy: {
      '/analyze-text': 'http://127.0.0.1:8000',
      '/analyze-audio': 'http://127.0.0.1:8000',
      '/clarify': 'http://127.0.0.1:8000',
      '/health': 'http://127.0.0.1:8000',
    },
  },
});
