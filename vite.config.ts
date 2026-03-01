import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/gobang/', // GitHub Pages 部署路径
  build: {
    outDir: 'docs',
    emptyDirBeforeWrite: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
