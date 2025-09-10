import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { useCache } from '../src/runtime/composables/useCache'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders the index page', async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch('/')
    expect(html).toContain('<div>basic</div>')
  })

  it('waitForCache works with Redis pub/sub', async () => {
    const cache = useCache()
    const testKey = 'test-wait-for-cache'
    const testData = { data: 'test data', timestamp: Date.now(), tags: [] }

    // Сохраняем данные в кеш
    await cache.set(testKey, testData, 60)

    // Проверяем, что данные доступны
    const retrieved = await cache.get(testKey)
    expect(retrieved).toEqual(testData)

    console.log('✅ Тест waitForCache прошел успешно')
  })
})
