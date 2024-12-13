import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/moodscapesupdated/',  // Add this line for GitHub Pages
  server: {
    port: 3000,
    open: true
  },
  root: './src',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});