import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative base so built files reference assets with relative paths.
  // This avoids root-absolute `/assets/...` references when deploying to different paths.
  base: './',
  server: { port: 5173, open: true },
  build: { target: 'es2020' }
});
