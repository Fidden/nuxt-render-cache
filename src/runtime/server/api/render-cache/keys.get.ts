import { createError, defineEventHandler } from 'h3'
import { useCache } from '../../../composables/useCache'

/**
 * API endpoint для получения списка всех ключей кеша
 *
 * GET /render-cache/keys
 *
 * Headers:
 * - x-render-cache-api: <token>
 *
 * Response:
 * {
 *   "keys": ["key1", "key2", ...],
 *   "count": 10
 * }
 */
export default defineEventHandler(async () => {
  try {
    const cache = useCache()
    const keys = await cache.getAllKeys()
    const tags = await cache.getAllTags()

    return {
      keys,
      tags,
      count: keys.length,
      success: true,
    }
  }
  catch (error) {
    console.error('[API] Ошибка при получении списка ключей:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Failed to get cache keys',
    })
  }
})
