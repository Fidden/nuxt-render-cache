import { createError, defineEventHandler, getRouterParam } from 'h3'
import { useCache } from '../../../../composables/useCache'

/**
 * API endpoint для удаления конкретного ключа кеша
 *
 * DELETE /render-cache/keys/[key]
 *
 * Headers:
 * - x-render-cache-api: <token>
 *
 * Response:
 * {
 *   "key": "cache-key",
 *   "deleted": true,
 *   "success": true
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
    const deletedCount = await cache.deleteKey(key)

    return {
      key,
      deleted: deletedCount > 0,
      success: true,
    }
  }
  catch (error) {
    console.error(
      `[API] Ошибка при удалении ключа ${getRouterParam(event, 'key')}:`,
      error,
    )
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Failed to delete cache key',
    })
  }
})
