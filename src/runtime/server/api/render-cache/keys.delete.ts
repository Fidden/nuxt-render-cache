import { createError, defineEventHandler, getQuery, readBody } from 'h3'
import { useCache } from '../../../composables/useCache'
/**
 * API endpoint для удаления ключей кеша по тегам
 *
 * DELETE /render-cache/keys?tags=tag1,tag2,tag3
 *
 * Или в теле запроса:
 * {
 *   "tags": ["tag1", "tag2", "tag3"]
 * }
 *
 * Headers:
 * - x-render-cache-api: <token>
 *
 * Response:
 * {
 *   "tags": ["tag1", "tag2"],
 *   "deletedCount": 5,
 *   "success": true
 * }
 */
export default defineEventHandler(async (event) => {
  try {
    // Получаем теги из query параметров или из тела запроса
    let tags: string[] = []

    const queryTags = getQuery(event).tags as string | undefined
    if (queryTags) {
      tags = queryTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    }

    // Если теги не переданы в query, проверяем тело запроса
    if (tags.length === 0) {
      const body = await readBody(event).catch(() => ({}))
      if (body.tags && Array.isArray(body.tags)) {
        tags = body.tags.filter(
          (tag: string) => typeof tag === 'string' && tag.trim().length > 0,
        )
      }
    }

    if (tags.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Bad Request: Tags parameter is required (query: ?tags=tag1,tag2 or body: {"tags": ["tag1", "tag2"]})',
      })
    }

    const cache = useCache()
    const deletedCount = await cache.deleteByTags(tags)

    return {
      tags,
      deletedCount,
      success: true,
    }
  }
  catch (error) {
    console.error('[API] Ошибка при удалении ключей по тегам:', error)
    throw createError({
      statusCode: 500,
      statusMessage:
        'Internal Server Error: Failed to delete cache keys by tags',
    })
  }
})
