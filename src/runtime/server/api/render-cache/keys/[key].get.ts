import { createError, defineEventHandler, getRouterParam } from 'h3'
import { useCache } from '../../../../composables/useCache'
/**
 * API endpoint для получения значения конкретного ключа кеша
 *
 * GET /render-cache/keys/[key]
 *
 * Headers:
 * - x-render-cache-api: <token>
 *
 * Response:
 * {
 *   "key": "cache-key",
 *   "data": "cached content",
 *   "timestamp": 1234567890,
 *   "tags": ["tag1", "tag2"],
 *   "exists": true
 * }
 */
export default defineEventHandler(async (event) => {
  try {
    const key = getRouterParam(event, 'key')

    if (!key) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request: Key parameter is required',
      })
    }

    const cache = useCache()
    const entry = await cache.get(key)

    if (!entry) {
      return {
        key,
        exists: false,
        success: true,
      }
    }

    return {
      key,
      data: entry.data,
      timestamp: entry.timestamp,
      tags: entry.tags,
      exists: true,
      success: true,
    }
  }
  catch (error) {
    console.error(
      `[API] Ошибка при получении ключа ${getRouterParam(event, 'key')}:`,
      error,
    )
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Failed to get cache key',
    })
  }
})
