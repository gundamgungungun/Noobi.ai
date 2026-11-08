import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    // Keep fonts on the app's own origin, as required by font-src 'self'.
    assetsInlineLimit: (filePath) => /\.(?:woff2?|ttf|otf)$/iu.test(filePath) ? false : undefined,
  },
});

