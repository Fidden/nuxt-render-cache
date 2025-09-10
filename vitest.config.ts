import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 120000, // 2 минуты для e2e тестов
    hookTimeout: 60000,
    globals: true,
  },
})
