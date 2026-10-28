// vite.config.ts — Vite8; preserve the rest of the application's configuration
import { defineConfig } from 'vite';
export default defineConfig({
  build: { manifest: true, sourcemap: 'hidden' }
});
