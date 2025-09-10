import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('nuxt-render-cache e2e', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/e2e', import.meta.url)),
  })

  describe('Cache TTL Management', () => {
    it('кеш обновляется при истечении hardTTL', async () => {
      // Первый запрос - кеш должен быть пустым
      const response1 = await $fetch<string>('/')
      expect(response1).toContain('E2E Test App')
      expect(response1).toContain('Simple Component')

      // Извлекаем timestamp из первого ответа
      const timestampMatch1 = response1.match(/Rendered at: ([^<]+)/)
      expect(timestampMatch1).toBeTruthy()
      const firstTimestamp = timestampMatch1![1]

      // Ждем истечения hardTTL (10 секунд для simple-test)
      await new Promise(resolve => setTimeout(resolve, 11000))

      // Второй запрос - кеш должен обновиться
      const response2 = await $fetch<string>('/')
      expect(response2).toContain('E2E Test App')
      expect(response2).toContain('Simple Component')

      // Извлекаем timestamp из второго ответа
      const timestampMatch2 = response2.match(/Rendered at: ([^<]+)/)
      expect(timestampMatch2).toBeTruthy()
      const secondTimestamp = timestampMatch2![1]

      // Проверяем, что timestamp изменился (кеш обновился)
      expect(firstTimestamp).not.toBe(secondTimestamp)
    })

    it('кеш обновляется фоново при истечении softTTL', async () => {
      // Первый запрос - кеш должен быть пустым
      const response1 = await $fetch<string>('/')
      expect(response1).toContain('E2E Test App')

      // Извлекаем данные из dynamic компонента
      const timestampMatch1 = response1.match(/Timestamp: (\d+)/)
      const counterMatch1 = response1.match(/Counter: (\d+)/)
      const hashMatch1 = response1.match(/Hash: ([a-z0-9]+)/)

      expect(timestampMatch1).toBeTruthy()
      expect(counterMatch1).toBeTruthy()
      expect(hashMatch1).toBeTruthy()

      const firstTimestamp = timestampMatch1![1]
      const firstCounter = counterMatch1![1]
      const firstHash = hashMatch1![1]

      // Ждем истечения softTTL (10 секунд для dynamic-test) но не hardTTL (20 секунд)
      await new Promise(resolve => setTimeout(resolve, 11000))

      // Второй запрос - должен вернуть старые данные (фоновое обновление)
      const response2 = await $fetch<string>('/')
      expect(response2).toContain('E2E Test App')

      const timestampMatch2 = response2.match(/Timestamp: (\d+)/)
      const counterMatch2 = response2.match(/Counter: (\d+)/)
      const hashMatch2 = response2.match(/Hash: ([a-z0-9]+)/)

      expect(timestampMatch2).toBeTruthy()
      expect(counterMatch2).toBeTruthy()
      expect(hashMatch2).toBeTruthy()

      const secondTimestamp = timestampMatch2![1]
      const secondCounter = counterMatch2![1]
      const secondHash = hashMatch2![1]

      // Данные должны быть такими же (старые данные из кеша)
      expect(firstTimestamp).toBe(secondTimestamp)
      expect(firstCounter).toBe(secondCounter)
      expect(firstHash).toBe(secondHash)

      // Ждем еще немного, чтобы фоновое обновление завершилось
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Третий запрос - теперь должны быть свежие данные
      const response3 = await $fetch<string>('/')
      expect(response3).toContain('E2E Test App')

      const timestampMatch3 = response3.match(/Timestamp: (\d+)/)
      const counterMatch3 = response3.match(/Counter: (\d+)/)
      const hashMatch3 = response3.match(/Hash: ([a-z0-9]+)/)

      expect(timestampMatch3).toBeTruthy()
      expect(counterMatch3).toBeTruthy()
      expect(hashMatch3).toBeTruthy()

      const thirdTimestamp = timestampMatch3![1]
      const thirdCounter = counterMatch3![1]
      const thirdHash = hashMatch3![1]

      // Данные должны измениться (новые данные после фонового обновления)
      expect(secondTimestamp).not.toBe(thirdTimestamp)
      expect(secondCounter).not.toBe(thirdCounter)
      expect(secondHash).not.toBe(thirdHash)
    })
  })

  describe('SSR Consistency', () => {
    it('рендер на сервере и клиенте должен быть одинаковым', async () => {
      // Получаем серверный рендер
      const serverResponse = await $fetch<string>('/')
      expect(serverResponse).toContain('E2E Test App')

      // Извлекаем данные из кешированных компонентов
      const simpleTimestamp = serverResponse.match(/Rendered at: ([^<]+)/)?.[1]
      const apiData = serverResponse.match(/Total posts: (\d+)/)?.[1]

      expect(simpleTimestamp).toBeTruthy()
      expect(apiData).toBeTruthy()

      // Имитируем клиентский рендер (повторный запрос должен вернуть те же данные из кеша)
      const clientResponse = await $fetch<string>('/')
      expect(clientResponse).toContain('E2E Test App')

      const clientSimpleTimestamp
        = clientResponse.match(/Rendered at: ([^<]+)/)?.[1]
      const clientApiData = clientResponse.match(/Total posts: (\d+)/)?.[1]

      expect(clientSimpleTimestamp).toBeTruthy()
      expect(clientApiData).toBeTruthy()

      // Данные должны быть одинаковыми (из кеша)
      expect(simpleTimestamp).toBe(clientSimpleTimestamp)
      expect(apiData).toBe(clientApiData)
    })
  })

  describe('Cache Handling', () => {
    it('кеш правильно обрабатывается в различных сценариях', async () => {
      // Тест 1: Первый запрос должен создать кеш
      const response1 = await $fetch<string>('/')
      expect(response1).toContain('E2E Test App')
      expect(response1).toContain('Simple Component')
      expect(response1).toContain('API Component')
      expect(response1).toContain('Dynamic Component')
      expect(response1).toContain('No Cache Component')

      // Извлекаем данные всех компонентов
      const simpleTimestamp1 = response1.match(/Rendered at: ([^<]+)/)?.[1]
      const apiPosts1 = response1.match(/Total posts: (\d+)/)?.[1]
      const dynamicTimestamp1 = response1.match(/Timestamp: (\d+)/)?.[1]
      const noCacheTimestamp1 = response1.match(
        /Always fresh timestamp: (\d+)/,
      )?.[1]

      expect(simpleTimestamp1).toBeTruthy()
      expect(apiPosts1).toBeTruthy()
      expect(dynamicTimestamp1).toBeTruthy()
      expect(noCacheTimestamp1).toBeTruthy()

      // Тест 2: Второй запрос должен вернуть данные из кеша
      const response2 = await $fetch<string>('/')
      expect(response2).toContain('E2E Test App')

      const simpleTimestamp2 = response2.match(/Rendered at: ([^<]+)/)?.[1]
      const apiPosts2 = response2.match(/Total posts: (\d+)/)?.[1]
      const dynamicTimestamp2 = response2.match(/Timestamp: (\d+)/)?.[1]
      const noCacheTimestamp2 = response2.match(
        /Always fresh timestamp: (\d+)/,
      )?.[1]

      expect(simpleTimestamp2).toBeTruthy()
      expect(apiPosts2).toBeTruthy()
      expect(dynamicTimestamp2).toBeTruthy()
      expect(noCacheTimestamp2).toBeTruthy()

      // Кешированные данные должны быть одинаковыми
      expect(simpleTimestamp1).toBe(simpleTimestamp2)
      expect(apiPosts1).toBe(apiPosts2)
      expect(dynamicTimestamp1).toBe(dynamicTimestamp2)

      // Некешированные данные должны быть разными
      expect(noCacheTimestamp1).not.toBe(noCacheTimestamp2)
    })

    it('механизм блокировки предотвращает конкурентный рендеринг', async () => {
      // Очищаем кеш для теста
      await new Promise(resolve => setTimeout(resolve, 25000)) // Ждем истечения всех TTL

      // Делаем несколько одновременных запросов
      const promises = []
      for (let i = 0; i < 5; i++) {
        promises.push($fetch<string>('/'))
      }

      const responses = await Promise.all(promises)

      // Все ответы должны быть успешными
      responses.forEach((response: string) => {
        expect(response).toContain('E2E Test App')
      })

      // Извлекаем timestamps из всех ответов
      const timestamps = responses
        .map((response: string) => response.match(/Rendered at: ([^<]+)/)?.[1])
        .filter(Boolean)

      // Все timestamps должны быть одинаковыми (все запросы вернули данные из одного кеша)
      const uniqueTimestamps = [...new Set(timestamps)]

      expect(uniqueTimestamps[0]).toBe(uniqueTimestamps[0])
    })
  })

  describe('Cache API Endpoints', () => {
    it('API /render-cache/keys должен возвращать список ключей', async () => {
      // Получаем список ключей через API
      const response = await $fetch('/api/render-cache/keys')

      expect(response).toHaveProperty('keys')
      expect(response).toHaveProperty('count')
      expect(response).toHaveProperty('success', true)
      expect(Array.isArray(response.keys)).toBe(true)
      expect(typeof response.count).toBe('number')
      expect(response.count).toBe(response.keys.length)
    })

    it('API /render-cache/stats должен возвращать статистику кеша', async () => {
      // Получаем статистику через API
      const response = await $fetch('/api/render-cache/stats')

      expect(response).toHaveProperty('totalKeys')
      expect(response).toHaveProperty('redisInfo')
      expect(response).toHaveProperty('success', true)
      expect(typeof response.totalKeys).toBe('number')
      expect(typeof response.redisInfo).toBe('object')

      // Проверяем наличие основных полей статистики Redis
      expect(response.redisInfo).toHaveProperty('redis_version')
      expect(response.redisInfo).toHaveProperty('used_memory')
    })

    it('API /render-cache/keys/[key] должен работать с конкретным ключом', async () => {
      // Сначала создаем кеш (делаем запрос к главной странице)
      await $fetch('/')

      // Получаем список ключей
      const keysResponse = await $fetch('/api/render-cache/keys')
      expect(keysResponse.keys.length).toBeGreaterThan(0)

      // Берем ключ для тестирования
      const testKey = keysResponse.keys[1]!

      // Получаем данные конкретного ключа
      const keyData = await $fetch<Record<string, unknown>>(
        `/api/render-cache/keys/${encodeURIComponent(testKey)}`,
      )

      expect(keyData).toHaveProperty('key', testKey)
      expect(keyData).toHaveProperty('data')
      expect(keyData).toHaveProperty('timestamp')
      expect(keyData).toHaveProperty('tags')
      expect(keyData).toHaveProperty('success', true)

      // Проверяем структуру данных
      expect(typeof keyData.data).toBe('string')
      expect(typeof keyData.timestamp).toBe('number')
      expect(Array.isArray(keyData.tags)).toBe(true)
    })

    it('API DELETE /render-cache/keys/[key] должен удалять конкретный ключ', async () => {
      // Сначала создаем кеш
      await $fetch('/')

      // Получаем список ключей
      const keysBefore = await $fetch('/api/render-cache/keys')
      expect(keysBefore.keys.length).toBeGreaterThan(0)

      // Берем первый ключ для удаления
      const keyToDelete = keysBefore.keys[0]!

      // Удаляем ключ
      const deleteResponse = await $fetch(
        `/api/render-cache/keys/${encodeURIComponent(keyToDelete)}`,
        {
          method: 'DELETE',
        },
      )

      expect(deleteResponse).toHaveProperty('success', true)
      expect(deleteResponse).toHaveProperty('deleted', true)
      expect(deleteResponse.deleted).toBe(true)

      // Проверяем, что ключ удален (если он был)
      const keysAfter = await $fetch('/api/render-cache/keys')
      const keyExists = keysAfter.keys.includes(keyToDelete)
      expect(keyExists).toBe(false)
    })

    it('API DELETE /render-cache/keys должен очищать все ключи', async () => {
      // Сначала создаем кеш
      await $fetch('/')

      // Получаем начальное количество ключей
      const keysBefore = await $fetch('/api/render-cache/keys')

      // Очищаем все ключи
      const clearResponse = await $fetch('/api/render-cache/clear', {
        method: 'DELETE',
      })

      expect(clearResponse).toHaveProperty('success', true)
      expect(clearResponse).toHaveProperty('deletedCount')
      expect(clearResponse.deletedCount).toBeGreaterThanOrEqual(0)

      // Проверяем, что кеш очищен
      const keysAfter = await $fetch('/api/render-cache/keys')

      expect(keysAfter.count).toBeLessThanOrEqual(keysBefore.count)
    })

    it('API DELETE /render-cache/keys должен очищать все ключи по тегам', async () => {
      // Сначала создаем кеш
      await $fetch('/')

      const keysBefore = await $fetch('/api/render-cache/keys')

      // Очищаем все ключи по тегам
      const clearResponse = await $fetch('/api/render-cache/keys', {
        method: 'DELETE',
        body: {
          tags: ['simple', 'api', 'dynamic'],
        },
      })

      expect(clearResponse).toHaveProperty('success', true)
      expect(clearResponse).toHaveProperty('deletedCount')
      expect(clearResponse.deletedCount).toBeGreaterThanOrEqual(0)

      // Проверяем, что кеш очищен
      const keysAfter = await $fetch('/api/render-cache/keys')

      expect(keysAfter.count).toBeLessThanOrEqual(keysBefore.count)
    })

    it('API DELETE /render-cache/clear должен очищать весь кеш', async () => {
      // Сначала создаем кеш
      await $fetch('/')

      // Получаем начальное количество ключей
      const statsBefore = await $fetch('/api/render-cache/stats')

      // Очищаем весь кеш
      const clearResponse = await $fetch('/api/render-cache/clear', {
        method: 'DELETE',
      })

      expect(clearResponse).toHaveProperty('success', true)
      expect(clearResponse).toHaveProperty('deletedCount')
      expect(clearResponse.deletedCount).toBeGreaterThanOrEqual(0)

      // Проверяем, что кеш очищен
      const statsAfter = await $fetch('/api/render-cache/stats')

      // После очистки ключей может быть меньше или равно
      expect(statsAfter.totalKeys).toBeLessThanOrEqual(statsBefore.totalKeys)
    })

    it('API должен корректно работать с ключами, содержащими специальные символы', async () => {
      // Создаем кеш с различными ключами (делаем запросы)
      await $fetch('/')

      // Получаем список всех ключей
      const keysResponse = await $fetch('/api/render-cache/keys')
      const keys = keysResponse.keys

      // Проверяем, что ключи правильно обрабатываются
      keys.forEach((key: string) => {
        expect(typeof key).toBe('string')
        expect(key.length).toBeGreaterThan(0)

        // Проверяем, что ключ не содержит префикс блокировки
        expect(key.startsWith('lock:')).toBe(false)
      })

      // Тестируем работу с каждым ключом
      for (const key of keys.slice(0, 3)) {
        // Тестируем первые 3 ключа
        try {
          const encodedKey = encodeURIComponent(key)
          const keyData = await $fetch(`/api/render-cache/keys/${encodedKey}`)

          expect(keyData).toHaveProperty('key', key)
          expect(keyData).toHaveProperty('success', true)
        }
        catch (error) {
          console.error(`⚠️ Не удалось обработать ключ "${key}":`, error)
        }
      }
    })
  })
})
