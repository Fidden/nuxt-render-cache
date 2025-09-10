import {
  addComponent,
  addServerHandler,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'

/**
 * Параметры конфигурации модуля Nuxt Render Cache
 */
export interface ModuleOptions {
  /**
   * Настройки TTL (времени жизни кеша)
   */
  ttl: {
    /**
     * Значение TTL по умолчанию для soft-кэширования в миллисекундах
     * Используется для фонового обновления кеша
     */
    softDefault: number
    /**
     * Значение TTL по умолчанию для hard-кэширования в миллисекундах
     * Используется для полного истечения кеша
     */
    hardDefault: number
    /**
     * Максимальное время ожидания рендеринга в миллисекундах
     * После истечения этого времени рендеринг будет прерван
     */
    renderTimeout: number
  }
}

/**
 * Nuxt модуль для кэширования рендеринга компонентов
 *
 * Предоставляет возможности для двухуровневого кэширования:
 * - Soft TTL: Фоновое обновление кеша без блокировки пользователя
 * - Hard TTL: Полное истечение кеша с блокировкой одновременного рендеринга
 *
 * @example
 * ```typescript
 * // nuxt.config.ts
 * export default defineNuxtConfig({
 *   modules: ['nuxt-render-cache'],
 *   renderCache: {
 *     ttl: {
 *       softDefault: 5000,  // 5 секунд для soft TTL
 *       hardDefault: 30000, // 30 секунд для hard TTL
 *       renderTimeout: 10000 // 10 секунд таймаут рендеринга
 *     }
 *   }
 * })
 * ```
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-render-cache',
    configKey: 'renderCache',
  },
  defaults: {
    ttl: {
      softDefault: 1000,
      hardDefault: 1000,
      renderTimeout: 5000,
    },
  },
  /**
   * Настройка модуля
   * Регистрирует компонент cache-render для использования в приложении
   *
   * @param _options - Параметры конфигурации модуля
   * @param _nuxt - Экземпляр Nuxt
   */
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    _nuxt.options.build.transpile.push('ioredis')
    _nuxt.options.build.transpile.push('standard-as-callback')

    _nuxt.options.vite.optimizeDeps?.include?.push('ioredis')
    if (Array.isArray(_nuxt.options.vite.ssr?.noExternal)) {
      _nuxt.options.vite.ssr?.noExternal?.push('standard-as-callback')
    }

    addComponent({
      name: 'cache-render',
      filePath: resolver.resolve('./runtime/components/cache-render.vue'),
    })

    addServerHandler({
      route: '/api/render-cache/keys',
      method: 'get',
      handler: resolver.resolve(
        './runtime/server/api/render-cache/keys.get.ts',
      ),
    })

    addServerHandler({
      route: '/api/render-cache/keys',
      method: 'delete',
      handler: resolver.resolve(
        './runtime/server/api/render-cache/keys.delete.ts',
      ),
    })

    addServerHandler({
      route: '/api/render-cache/keys/:key',
      method: 'get',
      handler: resolver.resolve(
        './runtime/server/api/render-cache/keys/[key].get.ts',
      ),
    })

    addServerHandler({
      route: '/api/render-cache/keys/:key',
      method: 'delete',
      handler: resolver.resolve(
        './runtime/server/api/render-cache/keys/[key].delete.ts',
      ),
    })

    addServerHandler({
      route: '/api/render-cache/clear',
      method: 'delete',
      handler: resolver.resolve(
        './runtime/server/api/render-cache/clear.delete.ts',
      ),
    })

    addServerHandler({
      route: '/api/render-cache/stats',
      method: 'get',
      handler: resolver.resolve(
        './runtime/server/api/render-cache/stats.get.ts',
      ),
    })

    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/auth.ts'),
      middleware: true,
    })
  },
})
