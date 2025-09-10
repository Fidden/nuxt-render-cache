import { createError, defineEventHandler } from 'h3'
import { useCache } from '../../../composables/useCache'

/**
 * API endpoint для получения статистики Redis и кеша
 *
 * GET /render-cache/stats
 *
 * Headers:
 * - x-render-cache-api: <token>
 *
 * Response:
 * {
 *   "totalKeys": 25,
 *   "redisInfo": {
 *     "redis_version": "7.0.0",
 *     "connected_clients": "5",
 *     "used_memory": "1024",
 *     "total_connections_received": "100",
 *     ...
 *   },
 *   "success": true
 * }
 */
export default defineEventHandler(async () => {
  try {
    const cache = useCache()
    const stats = await cache.getStats()

    return {
      ...stats,
      success: true,
    }
  }
  catch (error) {
    console.error('[API] Ошибка при получении статистики:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Failed to get cache statistics',
    })
  }
})
