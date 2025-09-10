/**
 * Проверяет, является ли переданный объект промисом.
 *
 * Эта функция проверяет, что переданный параметр является объектом,
 * не равен null, имеет свойство 'then' и это свойство является функцией.
 * Это соответствует спецификации промисов в JavaScript/TypeScript.
 *
 * @param p - Значение для проверки на соответствие интерфейсу промиса.
 * @returns `true`, если значение является промисом, иначе `false`.
 *
 * @example
 * ```typescript
 * console.log(isPromise(Promise.resolve(42))) // true
 * console.log(isPromise(new Promise(() => {}))) // true
 * console.log(isPromise({ then: () => {} })) // true
 * console.log(isPromise("not a promise")) // false
 * console.log(isPromise(null)) // false
 * console.log(isPromise(undefined)) // false
 * console.log(isPromise(42)) // false
 * ```
 */
export const isPromise = (p: unknown): boolean => {
  return (
    typeof p === 'object'
    && p !== null
    && 'then' in p
    && typeof p.then === 'function'
  )
}
