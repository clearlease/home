import { defineConfig } from 'vitest/config';
import dcPages from './src/dc/vite-plugin.mjs';

export default defineConfig({
  plugins: [dcPages()],
  test: { include: ['tests/unit/**/*.test.mjs'] },
});
