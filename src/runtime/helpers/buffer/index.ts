import { isPromise } from '../promise'

/**
 * Разворачивает буфер, содержащий различные типы данных, в единую строку.
 *
 * Эта функция асинхронно обрабатывает массив элементов, которые могут быть:
 * - Строками (добавляются напрямую)
 * - Промисами (сначала разрешаются, затем обрабатываются)
 * - Массивами (рекурсивно обрабатываются этой же функцией)
 * - Другими типами данных (преобразуются в строку)
 *
 * @param buffer - Массив элементов для обработки. Каждый элемент может быть
 *                 строкой, промисом, массивом или любым другим типом данных.
 * @returns Промис, который разрешается в итоговую строку после обработки всех элементов буфера.
 *
 * @example
 * ```typescript
 * // Пример с простыми строками
 * const result = await unrollBuffer(['Hello', ' ', 'world'])
 * console.log(result) // "Hello world"
 *
 * // Пример с промисами
 * const result = await unrollBuffer([
 *   'Start',
 *   Promise.resolve(' middle '),
 *   'end'
 * ])
 * console.log(result) // "Start middle end"
 *
 * // Пример с вложенными массивами
 * const result = await unrollBuffer([
 *   'A',
 *   ['B', 'C'],
 *   'D'
 * ])
 * console.log(result) // "ABCD"
 * ```
 */
export const unrollBuffer = async (buffer: unknown[]): Promise<string> => {
  let ret = ''
  for (let i = 0; i < buffer.length; i++) {
    let item = buffer[i]
    if (isPromise(item)) {
      item = await item
    }
    if (typeof item === 'string') {
      ret += item
    }
    else if (Array.isArray(item)) {
      ret += await unrollBuffer(item)
    }
    else {
      ret += String(item)
    }
  }
  return ret
}
