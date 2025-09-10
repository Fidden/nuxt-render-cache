import { createError, defineEventHandler, getHeader, getRequestURL } from 'h3'

/**
 * Middleware для проверки токена авторизации для API управления кешем
 */
export default defineEventHandler((event) => {
  // Проверяем, что это запрос к API управления кешем
  const url = getRequestURL(event)
  if (!url.pathname.startsWith('/api/render-cache/')) {
    return
  }

  // Получаем токен из заголовка
  const authToken = getHeader(event, 'x-render-cache-api')

  // Проверяем наличие токена
  if (!authToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Missing x-render-cache-api header',
    })
  }

  // Проверяем валидность токена
  // В production окружении здесь должна быть более строгая проверка
  // Например, проверка JWT токена или сравнение с секретным значением из переменных окружения
  if (authToken !== process.env.RENDER_CACHE_API_TOKEN) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Invalid token',
    })
  }

  // Токен валиден, продолжаем обработку запроса
})
