import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    exclude: ['**/node_modules/**', '**/vue3-app/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['app.js', 'exercises.js']
    }
  }
})
