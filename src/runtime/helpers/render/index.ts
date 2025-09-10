import type { ComponentInternalInstance, Slots } from 'vue'
import { ssrRenderSlotInner } from 'vue/server-renderer'
import { unrollBuffer } from '../buffer'

/**
 * Рендерит содержимое слотов компонента Vue в строку для серверного рендеринга.
 *
 * Эта функция использует внутренний механизм Vue для рендеринга слотов
 * в буфер, а затем преобразует этот буфер в единую строку с помощью {@link unrollBuffer}.
 * Используется в процессе кэширования рендеринга для сохранения HTML-содержимого компонентов.
 *
 * @param slots - Объект слотов компонента Vue, содержащий содержимое для рендеринга.
 * @param currentInstance - Внутренний экземпляр компонента Vue, необходимый для контекста рендеринга.
 * @returns Промис, который разрешается в строку HTML-содержимого после рендеринга всех слотов.
 *
 * @throws Ошибка может возникнуть при проблемах с рендерингом слотов Vue.
 *
 * @example
 * ```typescript
 * import { renderComponentToString } from './render'
 * import { getCurrentInstance } from 'vue'
 *
 * const instance = getCurrentInstance()
 * if (instance && instance.slots) {
 *   const html = await renderComponentToString(instance.slots, instance)
 *   console.log(html) // "<div>Hello World</div>"
 * }
 * ```
 */
export const renderComponentToString = async (
  slots: Slots,
  currentInstance: ComponentInternalInstance,
): Promise<string> => {
  const buffer: unknown[] = []
  const push = (v: unknown) => {
    buffer.push(v)
  }
  await ssrRenderSlotInner(slots, 'default', {}, null, push, currentInstance!)
  return await unrollBuffer(buffer)
}
