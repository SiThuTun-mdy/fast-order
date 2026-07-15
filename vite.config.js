import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['quickbite.local'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: false,
    css: false,
    // server/ is an independent Next.js app with its own vitest config and
    // node_modules — exclude it here so the two test suites stay separate.
    exclude: ['**/node_modules/**', 'server/**'],
  },
});
