import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    // CRITICAL: Exclude Walrus WASM from pre-bundling
    // Without this, you'll get: "WebAssembly.instantiate(): expected magic word..."
    exclude: ['@mysten/walrus-wasm'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  worker: {
    format: 'es',
  },
});
