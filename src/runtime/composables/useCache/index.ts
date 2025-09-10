import Redis from 'ioredis'

/**
2 * Клиент Redis для основных операций с кешем
 * Используется для чтения и записи данных
 */
const redis = new Redis()

/**
 * Отдельный клиент Redis для подписки на pub/sub
 * Redis не позволяет одновременно использовать pub и sub на одном клиенте
 */
const redisSubscriber = new Redis()

/**
 * Клиент Redis для публикации событий в pub/sub
 * Используется для уведомления о изменениях в кеше
 */
const redisPublisher = new Redis()

/**
 * Структура записи кеша
 */
type CacheEntry = {
  /** Закэшированные данные в виде строки */
  data: string
  /** Временная метка создания записи в миллисекундах */
  timestamp: number
  /** Теги для идентификации кешированного контента */
  tags: string[]
}

/**
 * Composable для работы с двухуровневым кешем на базе Redis
 *
 * Предоставляет методы для:
 * - Получения и сохранения данных в Redis
 * - Управления блокировками для предотвращения одновременного рендеринга
 * - Проверки истечения TTL
 * - Ожидания обновления кеша через pub/sub
 *
 * @returns Объект с методами для работы с кешем
 *
 * @example
 * ```typescript
 * const cache = useCache()
 *
 * // Сохранение данных
 * await cache.set('my-key', { data: 'content', timestamp: Date.now() }, 300)
 *
 * // Получение данных
 * const entry = await cache.get('my-key')
 *
 * // Проверка блокировки
 * const lock = await cache.lock('my-key', 30)
 * if (!lock.isLocked) {
 *   // Выполняем работу
 *   await lock.unlock()
 * }
 * ```
 */
export const useCache = () => {
  /**
   * Получить данные из Redis кеша
   *
   * @param key - Ключ кеша для поиска
   * @returns Запись кеша или null, если данные не найдены
   *
   * @example
   * ```typescript
   * const entry = await cache.get('user:123')
   * if (entry) {
   *   console.log('Данные найдены:', entry.data)
   * }
   * ```
   */
  const get = async (key: string): Promise<CacheEntry | null> => {
    const entry = await redis.get(key)
    if (!entry) {
      return null
    }

    const parsedEntry = JSON.parse(entry) as CacheEntry

    return parsedEntry
  }

  /**
   * Сохранить данные в Redis кеш с заданным TTL
   *
   * @param key - Ключ для сохранения данных
   * @param value - Запись кеша для сохранения
   * @param ttl - Время жизни кеша в секундах
   * @returns Результат операции сохранения (OK при успехе)
   *
   * @example
   * ```typescript
   * const result = await cache.set('page:home', {
   *   data: '<div>Home page content</div>',
   *   timestamp: Date.now()
   * }, 300) // TTL 5 минут
   * ```
   */
  const set = async (
    key: string,
    value: CacheEntry,
    ttl: number,
  ): Promise<string> => {
    // Сохраняем в Redis
    const result = await redis.set(key, JSON.stringify(value), 'EX', ttl)

    // Публикуем событие о том, что данные сохранены
    await redisPublisher.publish(`cache:${key}`, JSON.stringify(value))

    return result
  }

  /**
   * Установить блокировку для предотвращения одновременного рендеринга
   *
   * Использует Redis SET с флагом NX (только если ключ не существует)
   * для создания атомарной блокировки.
   *
   * @param key - Ключ для блокировки (обычно совпадает с ключом кеша)
   * @param ttl - Время жизни блокировки в секундах
   * @returns Объект с состоянием блокировки и функцией разблокировки
   *
   * @example
   * ```typescript
   * const lock = await cache.lock('render:page:home', 30)
   * if (!lock.isLocked) {
   *   try {
   *     // Выполняем рендеринг
   *     console.log('Блокировка получена, выполняем рендеринг')
   *   } finally {
   *     await lock.unlock() // Важно! Освободить блокировку
   *   }
   * } else {
   *   console.log('Блокировка занята другим процессом')
   * }
   * ```
   */
  const lock = async (key: string, ttl: number) => {
    const lockKey = `lock:${key}`
    const result = await redis.set(lockKey, 'locked', 'EX', ttl, 'NX')
    const isLocked = result !== 'OK'

    if (isLocked) {
      console.log(`[Cache] Лок ${lockKey} уже занят другим процессом`)
    }
    else {
      console.log(`[Cache] Лок ${lockKey} успешно получен, TTL: ${ttl}s`)
    }

    return {
      isLocked,
      unlock: async () => {
        console.log(`[Cache] Освобождаем лок ${lockKey}`)
        await redis.del(lockKey)
      },
    }
  }

  /**
   * Проверить истекли ли данные по указанному TTL
   *
   * Сравнивает текущее время с timestamp записи кеша.
   * Если записи нет в кеше, считается что она истекла.
   *
   * @param key - Ключ кеша для проверки
   * @param ttl - TTL в миллисекундах для сравнения
   * @returns true если данные истекли или отсутствуют, false если актуальны
   *
   * @example
   * ```typescript
   * const isExpired = await cache.expired('user:123', 300000) // 5 минут
   * if (isExpired) {
   *   console.log('Данные истекли, требуется обновление')
   * }
   * ```
   */
  const expired = async (key: string, ttl: number): Promise<boolean> => {
    const entry = await get(key)
    if (!entry) {
      return true
    }

    return Date.now() - entry.timestamp > ttl
  }

  /**
   * Ожидание появления данных в кеше через Redis pub/sub
   *
   * Использует event-driven подход для минимизации нагрузки на Redis.
   * Подписывается на канал с событиями обновления кеша и ждет
   * либо новых данных, либо истечения таймаута.
   *
   * @param key - Ключ кеша для ожидания
   * @param backupEntry - Резервная запись кеша (если есть)
   * @param maxWaitTime - Максимальное время ожидания в миллисекундах (по умолчанию 5000)
   * @returns Новые данные кеша или null при таймауте
   *
   * @example
   * ```typescript
   * // Ожидание обновления кеша в течение 10 секунд
   * const currentEntry = await cache.get('page:home')
   * const newEntry = await cache.waitForCache('page:home', currentEntry, 10000)
   *
   * if (newEntry) {
   *   console.log('Получены свежие данные:', newEntry.data)
   * } else {
   *   console.log('Таймаут ожидания')
   * }
   * ```
   */
  const waitForCache = async (
    key: string,
    backupEntry: CacheEntry | null,
    maxWaitTime: number = 5000,
  ): Promise<CacheEntry | null> => {
    console.log(`[Cache] Начинаем ожидание данных для ключа: ${key}`)

    // Создаем промис ожидания
    return new Promise<CacheEntry | null>((resolve, reject) => {
      let isResolved = false
      const channel = `cache:${key}`

      // Функция для завершения ожидания
      const cleanup = () => {
        if (!isResolved) {
          isResolved = true
          redisSubscriber.unsubscribe(channel)
        }
      }

      // Устанавливаем таймаут
      const timeout = setTimeout(() => {
        console.log(`[Cache] Таймаут ожидания для ключа: ${key}`)
        cleanupWithHandler()
        resolve(null)
      }, maxWaitTime)

      // Подписываемся на канал
      redisSubscriber.subscribe(channel, (err, count) => {
        if (err) {
          console.error(`[Cache] Ошибка подписки на канал ${channel}:`, err)
          cleanup()
          reject(err)
          return
        }

        console.log(
          `[Cache] Подписались на канал ${channel}, активных подписок: ${count}`,
        )
      })

      // Обработчик сообщений
      const messageHandler = (receivedChannel: string, message: string) => {
        if (receivedChannel === channel && !isResolved) {
          console.log(`[Cache] Получено событие для ключа: ${key}`)
          try {
            const cacheEntry = JSON.parse(message) as CacheEntry
            wrappedResolve(cacheEntry)
          }
          catch (error) {
            console.error(
              `[Cache] Ошибка парсинга сообщения для ключа ${key}:`,
              error,
            )
          }
        }
      }

      redisSubscriber.on('message', messageHandler)
      get(key).then((entry) => {
        if (!backupEntry || !entry) {
          return
        }

        if (backupEntry.timestamp < entry.timestamp) {
          wrappedResolve(backupEntry)
        }
      })

      // Функция для очистки обработчика при завершении
      const cleanupWithHandler = () => {
        redisSubscriber.off('message', messageHandler)
        cleanup()
      }

      // Создаем обертку для resolve с корректной очисткой
      const wrappedResolve = (value: CacheEntry | null) => {
        clearTimeout(timeout)
        cleanupWithHandler()
        resolve(value)
      }
    })
  }

  /**
   * Получить все ключи кеша
   *
   * @returns Массив всех ключей кеша (исключая ключи блокировок)
   *
   * @example
   * ```typescript
   * const keys = await cache.getAllKeys()
   * console.log('Все ключи кеша:', keys)
   * ```
   */
  const getAllKeys = async (): Promise<string[]> => {
    const keys = await redis.keys('*')
    // Фильтруем ключи, исключая ключи блокировок
    return keys.filter(key => !key.startsWith('lock:'))
  }

  const getAllTags = async (): Promise<string[]> => {
    const keys = await getAllKeys()
    const tagsPromises = keys.map(key => get(key).then(entry => entry?.tags))
    const tagsArray = await Promise.all(tagsPromises)
    return tagsArray.flatMap(tags => tags ?? [])
  }

  /**
   * Удалить ключ из кеша
   *
   * @param key - Ключ для удаления
   * @returns Количество удаленных ключей (0 или 1)
   *
   * @example
   * ```typescript
   * const deletedCount = await cache.deleteKey('page:home')
   * if (deletedCount > 0) {
   *   console.log('Ключ удален')
   * }
   * ```
   */
  const deleteKey = async (key: string): Promise<number> => {
    console.log(`[Cache] Удаляем ключ: ${key}`)
    return await redis.del(key)
  }

  /**
   * Удалить ключи по тегам
   *
   * @param tags - Массив тегов для поиска ключей
   * @returns Количество удаленных ключей
   *
   * @example
   * ```typescript
   * const deletedCount = await cache.deleteByTags(['page', 'home'])
   * console.log(`Удалено ${deletedCount} ключей`)
   * ```
   */
  const deleteByTags = async (tags: string[]): Promise<number> => {
    console.log(`[Cache] Удаляем ключи по тегам: ${tags.join(', ')}`)

    const allKeys = await getAllKeys()
    let deletedCount = 0

    for (const key of allKeys) {
      const entry = await get(key)
      if (entry && tags.some(tag => entry.tags.includes(tag))) {
        const result = await deleteKey(key)
        deletedCount += result
      }
    }

    console.log(`[Cache] Удалено ${deletedCount} ключей по тегам`)
    return deletedCount
  }

  /**
   * Очистить весь кеш
   *
   * @returns Количество удаленных ключей
   *
   * @example
   * ```typescript
   * const deletedCount = await cache.clearAll()
   * console.log(`Очищено ${deletedCount} ключей`)
   * ```
   */
  const clearAll = async (): Promise<number> => {
    console.log(`[Cache] Очищаем весь кеш`)

    const allKeys = await getAllKeys()
    if (allKeys.length === 0) {
      return 0
    }

    const result = await redis.del(allKeys)
    console.log(`[Cache] Удалено ${result} ключей`)
    return result
  }

  /**
   * Получить статистику Redis
   *
   * @returns Объект со статистикой использования Redis
   *
   * @example
   * ```typescript
   * const stats = await cache.getStats()
   * console.log('Статистика Redis:', stats)
   * ```
   */
  const getStats = async () => {
    const info = await redis.info()
    const keysCount = (await getAllKeys()).length

    // Парсим основные метрики из INFO
    const lines = info.split('\n')
    const stats = {
      totalKeys: keysCount,
      redisInfo: {} as Record<string, string>,
    } as const

    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':')
        if (key && value) {
          stats.redisInfo[key.trim()] = value.trim()
        }
      }
    }

    return stats
  }

  return {
    get,
    set,
    lock,
    expired,
    waitForCache,
    getAllKeys,
    getAllTags,
    deleteKey,
    deleteByTags,
    clearAll,
    getStats,
  }
}
