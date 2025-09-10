import { createError, defineEventHandler } from 'h3'
import { useCache } from '../../../composables/useCache'

/**
 * API endpoint для очистки всего кеша
 *
 * DELETE /render-cache/clear
 *
 * Headers:
 * - x-render-cache-api: <token>
 *
 * Response:
 * {
 *   "cleared": true,
 *   "deletedCount": 25,
 *   "success": true
 * }
 */
export default defineEventHandler(async (_event) => {
  try {
    const cache = useCache()
    const deletedCount = await cache.clearAll()

    return {
      cleared: true,
      deletedCount,
      success: true,
    }
  }
  catch (error) {
    console.error('[API] Ошибка при очистке кеша:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Failed to clear cache',
    })
  }
})
