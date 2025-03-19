import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        src: resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: 'build',
    },
    plugins: [react()],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "rsuite/dist/styles/rsuite-default.css";`,
        },
      },
    },
  };
});
