import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const demo = process.env.VITE_DEMO === '1';

// Демо-сборка: шрифты подключаются с Google Fonts, поэтому локальные @font-face убираем
const stripFonts = {
  name: 'strip-local-fonts',
  transform(code, id) {
    if (demo && id.endsWith('global.css')) return code.replace(/@font-face \{[^}]*\}\n/g, '');
  },
};

export default defineConfig({
  base: demo ? './' : '/',
  plugins: [react(), stripFonts],
  resolve: { alias: { '@shared': path.resolve(import.meta.dirname, '../shared') } },
  server: { port: 5173, proxy: { '/api': 'http://localhost:8080' }, fs: { allow: ['..'] } },
  build: { outDir: demo ? 'dist-demo' : 'dist', chunkSizeWarningLimit: 1200, copyPublicDir: !demo },
});
