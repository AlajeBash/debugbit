import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        sidepanel: resolve(__dirname, 'sidepanel.html'),
        devtools: resolve(__dirname, 'devtools.html'),
        panel: resolve(__dirname, 'panel.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        bridge: resolve(__dirname, 'src/content/bridge.ts'),
        collector: resolve(__dirname, 'src/inject/collector.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (['background', 'bridge', 'collector'].includes(chunkInfo.name)) {
            return '[name].js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
