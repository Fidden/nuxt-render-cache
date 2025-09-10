import type { ComponentInternalInstance, Slots } from 'vue'
import { renderComponentToString } from '../helpers/render'
import { useCache } from './useCache'

/**
 * Параметры конфигурации для рендеринга с кешированием
 */
export interface IRenderCacheOptions {
  /** Уникальный ключ для идентификации кешированного контента */
  cacheKey: string
  /** TTL в секундах для полного истечения кеша (hard TTL) */
  hardTtl: number
  /** TTL в секундах для фонового обновления кеша (soft TTL) */
  softTtl: number
  /** Теги для идентификации кешированного контента */
  cacheTags: string[]
}

/** Таймаут блокировки в секундах для предотвращения одновременного рендеринга */
const LOCK_TIMEOUT = 5

/**
 * Composable для рендеринга Vue компонентов с двухуровневым кешированием
 *
 * Реализует стратегию кеширования с двумя TTL:
 * - Hard TTL: Полное истечение кеша, требует обязательного обновления
 * - Soft TTL: Фоновое обновление кеша без блокировки пользователя
 *
 * Использует блокировки для предотвращения одновременного рендеринга
 * одного и того же контента несколькими процессами.
 *
 * @param options - Параметры конфигурации кеширования
 * @returns Объект с методом render для выполнения рендеринга
 *
 * @example
 * ```typescript
 * const renderCache = useRenderCache({
 *   cacheKey: 'page:home',
 *   hardTTL: 300,  // 5 минут
 *   softTTL: 60    // 1 минута
 * })
 *
 * // Рендеринг компонента с кешированием
 * const html = await renderCache.render(slots, instance)
 * ```
 */
export const useRenderCache = (options: IRenderCacheOptions) => {
  const cache = useCache()
  const { cacheKey, hardTtl, softTtl, cacheTags = [] } = options

  /**
   * Рендеринг компонента и сохранение результата в кеш
   *
   * Выполняет полный цикл:
   * 1. Рендерит Vue компонент в HTML строку
   * 2. Измеряет время рендеринга для логирования
   * 3. Сохраняет результат в Redis с заданным hardTTL
   * 4. Логирует результаты операции
   *
   * @param slots - Слоты Vue компонента для рендеринга
   * @param currentInstance - Внутренний экземпляр Vue компонента
   * @returns HTML строка отрендеренного компонента
   *
   * @private
   */
  const renderAndCache = async (
    slots: Slots,
    currentInstance: ComponentInternalInstance,
  ): Promise<string> => {
    console.log(`[RenderCache] Рендерим компонент для ключа: ${cacheKey}`)

    const startTime = Date.now()
    const renderedContent = await renderComponentToString(
      slots,
      currentInstance,
    )
    const renderTime = Date.now() - startTime

    console.log(
      `[RenderCache] Рендер завершен за ${renderTime}ms для ключа: ${cacheKey}`,
    )

    // Сохраняем в кеш
    const cacheEntry = {
      data: renderedContent,
      timestamp: Date.now(),
      tags: cacheTags,
    }

    await cache.set(cacheKey, cacheEntry, hardTtl)
    console.log(
      `[RenderCache] Данные сохранены в кеш с TTL ${hardTtl}s для ключа: ${cacheKey}`,
    )

    return renderedContent
  }

  /**
   * Обработка случая истечения softTTL - фоновое обновление
   *
   * Когда softTTL истек, но hardTTL еще актуален:
   * - Немедленно возвращает пользователю старые данные из кеша
   * - Запускает фоновое обновление кеша без блокировки пользователя
   *
   * Это позволяет обеспечить быструю загрузку для пользователя,
   * одновременно обновляя кеш в фоне.
   *
   * @param slots - Слоты Vue компонента для рендеринга
   * @param currentInstance - Внутренний экземпляр Vue компонента
   * @returns HTML строка из текущего кеша (старые данные)
   *
   * @private
   */
  const handleSoftExpiredCache = async (
    slots: Slots,
    currentInstance: ComponentInternalInstance,
  ): Promise<string> => {
    console.log(`[RenderCache] Кеш протух (softTTL) для ключа: ${cacheKey}`)

    // Получаем текущие данные из кеша
    const cachedEntry = await cache.get(cacheKey)
    if (!cachedEntry) {
      // Если кеша нет, обрабатываем как hardExpired
      return await handleHardExpiredCache(slots, currentInstance)
    }

    // Пытаемся получить блокировку для фонового обновления
    const lockResult = await cache.lock(cacheKey, LOCK_TIMEOUT)

    if (lockResult.isLocked) {
      // Другой процесс уже обновляет, возвращаем старые данные
      console.log(
        `[RenderCache] Другой процесс обновляет кеш, возвращаем старые данные для ключа: ${cacheKey}`,
      )
      return cachedEntry.data
    }

    // Мы получили блокировку, запускаем фоновое обновление
    // Сначала возвращаем старые данные пользователю
    const oldData = cachedEntry.data

    // Фоновое обновление кеша
    setImmediate(async () => {
      try {
        console.log(
          `[RenderCache] Начинаем фоновое обновление кеша для ключа: ${cacheKey}`,
        )
        await renderAndCache(slots, currentInstance)
        console.log(
          `[RenderCache] Фоновое обновление завершено для ключа: ${cacheKey}`,
        )
      }
      catch (error) {
        console.error(
          `[RenderCache] Ошибка при фоновом обновлении кеша для ключа ${cacheKey}:`,
          error,
        )
      }
      finally {
        await lockResult.unlock()
      }
    })

    return oldData
  }

  /**
   * Основная логика рендеринга компонента с кешированием
   *
   * Выполняет интеллектуальный рендеринг на основе состояния кеша:
   * 1. Если hardTTL истек - выполняет полный рендеринг с блокировкой
   * 2. Если softTTL истек - возвращает старые данные и запускает фоновое обновление
   * 3. Если кеш актуален - возвращает данные из кеша
   *
   * @param slots - Слоты Vue компонента для рендеринга
   * @param currentInstance - Внутренний экземпляр Vue компонента
   * @returns HTML строка отрендеренного компонента
   *
   * @throws {Error} Если не удалось получить новые данные кеша при hardTTL
   */
  const render = async (
    slots: Slots,
    currentInstance: ComponentInternalInstance,
  ): Promise<string> => {
    try {
      // Проверяем существует ли кеш и не истек ли hardTTL
      const isHardExpired = await cache.expired(cacheKey, hardTtl)

      if (isHardExpired) {
        // Кеш полностью истек или отсутствует - нужен полный рендер
        return await handleHardExpiredCache(slots, currentInstance)
      }

      // Кеш существует, проверяем softTTL
      const isSoftExpired = await cache.expired(cacheKey, softTtl)

      if (isSoftExpired) {
        // Кеш протух по softTTL - фоновое обновление
        return await handleSoftExpiredCache(slots, currentInstance)
      }

      // Кеш свежий - возвращаем из кеша
      const cachedEntry = await cache.get(cacheKey)
      if (cachedEntry) {
        console.log(
          `[RenderCache] Возвращаем свежие данные из кеша для ключа: ${cacheKey}`,
        )
        return cachedEntry.data
      }

      // Fallback - если что-то пошло не так, рендерим заново
      return await renderAndCache(slots, currentInstance)
    }
    catch (error) {
      console.error(
        `[RenderCache] Ошибка при работе с кешем для ключа ${cacheKey}:`,
        error,
      )
      // В случае ошибки рендерим без кеша
      return await renderComponentToString(slots, currentInstance)
    }
  }

  /**
   * Обработка случая полного истечения кеша (hardTTL)
   *
   * Когда кеш полностью истек, необходимо выполнить рендеринг.
   * Использует механизм блокировок для предотвращения одновременного
   * рендеринга одного контента несколькими процессами.
   *
   * Если блокировка уже установлена другим процессом, ждет завершения
   * рендеринга через pub/sub механизм.
   *
   * @param slots - Слоты Vue компонента для рендеринга
   * @param currentInstance - Внутренний экземпляр Vue компонента
   * @returns HTML строка отрендеренного компонента
   *
   * @private
   */
  const handleHardExpiredCache = async (
    slots: Slots,
    currentInstance: ComponentInternalInstance,
  ): Promise<string> => {
    console.log(`[RenderCache] Кеш истек (hardTTL) для ключа: ${cacheKey}`)

    // Пытаемся получить блокировку
    const lockResult = await cache.lock(cacheKey, LOCK_TIMEOUT)

    if (lockResult.isLocked) {
      // Другой процесс уже рендерит, ждем результат
      console.log(
        `[RenderCache] Ожидаем завершения рендера другим процессом для ключа: ${cacheKey}`,
      )

      const backupCacheEntry = await cache.get(cacheKey)
      const newCacheEntry = await cache.waitForCache(cacheKey, backupCacheEntry)
      if (newCacheEntry) {
        return newCacheEntry.data
      }

      throw new Error('Failed to get new cache entry')

      // return await renderComponentToString(slots, currentInstance)
    }
    else {
      // Мы получили блокировку, рендерим и кешируем
      try {
        return await renderAndCache(slots, currentInstance)
      }
      finally {
        await lockResult.unlock()
      }
    }
  }

  return {
    render,
  }
}
