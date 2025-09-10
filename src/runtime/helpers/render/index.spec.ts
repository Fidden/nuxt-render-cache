import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComponentInternalInstance, Slots } from 'vue'
import { renderComponentToString } from './index'

// Мокаем зависимости
vi.mock('vue/server-renderer', () => ({
  ssrRenderSlotInner: vi.fn(),
}))

vi.mock('../buffer/index', () => ({
  unrollBuffer: vi.fn(),
}))

describe('renderComponentToString', () => {
  beforeEach(() => {
    // Очищаем все моки перед каждым тестом
    vi.clearAllMocks()
  })
  it('должен корректно рендерить компонент в строку', async () => {
    // Импортируем моки внутри теста
    const { ssrRenderSlotInner } = await import('vue/server-renderer')
    const { unrollBuffer } = await import('../buffer')

    // Мокаем входные данные
    const mockSlots = {} as Slots
    const mockCurrentInstance = {} as ComponentInternalInstance

    // Настраиваем моки для этого теста
    vi.mocked(ssrRenderSlotInner).mockImplementation(
      async (_slots, _name, _props, _fallback, _push) => {
        // Ничего не добавляем в буфер для простоты
      },
    )
    const expectedResult = '<div>Hello World</div>'
    vi.mocked(unrollBuffer).mockResolvedValue(expectedResult)

    // Вызываем функцию
    const result = await renderComponentToString(mockSlots, mockCurrentInstance)

    // Проверяем, что ssrRenderSlotInner был вызван с правильными параметрами
    expect(ssrRenderSlotInner).toHaveBeenCalledTimes(1)
    expect(ssrRenderSlotInner).toHaveBeenCalledWith(
      mockSlots,
      'default',
      {},
      null,
      expect.any(Function), // push функция
      mockCurrentInstance,
    )

    // Проверяем, что unrollBuffer был вызван
    expect(unrollBuffer).toHaveBeenCalledTimes(1)
    expect(unrollBuffer).toHaveBeenCalledWith([])

    // Проверяем результат
    expect(result).toBe(expectedResult)
  })

  it('должен передать корректную push функцию в ssrRenderSlotInner', async () => {
    const { ssrRenderSlotInner } = await import('vue/server-renderer')
    const { unrollBuffer } = await import('../buffer')

    const mockSlots = {} as Slots
    const mockCurrentInstance = {} as ComponentInternalInstance
    const mockUnrollResult = 'rendered content'

    // Настраиваем моки для этого теста
    vi.mocked(ssrRenderSlotInner).mockImplementation(
      async (slots, name, props, fallback, push) => {
        // Вызываем push функцию для проверки
        push('test content')
      },
    )
    vi.mocked(unrollBuffer).mockResolvedValue(mockUnrollResult)

    await renderComponentToString(mockSlots, mockCurrentInstance)

    // Получаем push функцию, которая была передана в ssrRenderSlotInner
    const calls = vi.mocked(ssrRenderSlotInner).mock.calls
    expect(calls.length).toBeGreaterThan(0)
    const pushFunction = calls[0]?.[4]
    expect(typeof pushFunction).toBe('function')

    // Проверяем, что push функция может быть вызвана
    expect(() => pushFunction && pushFunction('additional test')).not.toThrow()

    // Проверяем, что unrollBuffer получил данные от push функции
    expect(unrollBuffer).toHaveBeenCalledWith([
      'test content',
      'additional test',
    ])
  })

  it('должен создавать новый буфер для каждого вызова', async () => {
    const { ssrRenderSlotInner } = await import('vue/server-renderer')
    const { unrollBuffer } = await import('../buffer')

    const mockSlots = {} as Slots
    const mockCurrentInstance = {} as ComponentInternalInstance

    // Настраиваем ssrRenderSlotInner чтобы он не добавлял ничего в буфер
    vi.mocked(ssrRenderSlotInner).mockImplementation(
      async (_slots, _name, _props, _fallback, _push) => {
        // Ничего не добавляем в буфер
      },
    )

    vi.mocked(unrollBuffer).mockResolvedValue('result1')

    await renderComponentToString(mockSlots, mockCurrentInstance)

    // Проверяем, что unrollBuffer был вызван с пустым массивом
    const calls = vi.mocked(unrollBuffer).mock.calls
    expect(calls.length).toBeGreaterThan(0)
    expect(calls[0]?.[0]).toEqual([])

    vi.mocked(unrollBuffer).mockResolvedValue('result2')

    await renderComponentToString(mockSlots, mockCurrentInstance)

    // Проверяем, что каждый вызов использует новый пустой буфер
    expect(calls.length).toBeGreaterThan(1)
    expect(calls[1]?.[0]).toEqual([])
  })

  it('должен обрабатывать ошибки от ssrRenderSlotInner', async () => {
    const { ssrRenderSlotInner } = await import('vue/server-renderer')
    const { unrollBuffer } = await import('../buffer')

    const mockSlots = {} as Slots
    const mockCurrentInstance = {} as ComponentInternalInstance
    const testError = new Error('SSR render error')

    // Настраиваем моки для этого теста
    vi.mocked(ssrRenderSlotInner).mockRejectedValue(testError)
    vi.mocked(unrollBuffer).mockResolvedValue('success')

    await expect(
      renderComponentToString(mockSlots, mockCurrentInstance),
    ).rejects.toThrow('SSR render error')
  })

  it('должен обрабатывать ошибки от unrollBuffer', async () => {
    const { ssrRenderSlotInner } = await import('vue/server-renderer')
    const { unrollBuffer } = await import('../buffer')

    const mockSlots = {} as Slots
    const mockCurrentInstance = {} as ComponentInternalInstance
    const testError = new Error('Buffer unroll error')

    // Настраиваем моки для этого теста
    vi.mocked(ssrRenderSlotInner).mockImplementation(
      async (_slots, _name, _props, _fallback, _push) => {
        // Ничего не делаем, чтобы дойти до unrollBuffer
      },
    )
    vi.mocked(unrollBuffer).mockRejectedValue(testError)

    await expect(
      renderComponentToString(mockSlots, mockCurrentInstance),
    ).rejects.toThrow('Buffer unroll error')
  })

  it('должен корректно передавать currentInstance в ssrRenderSlotInner', async () => {
    const { ssrRenderSlotInner } = await import('vue/server-renderer')
    const { unrollBuffer } = await import('../buffer')

    const mockSlots = {} as Slots
    const mockCurrentInstance = { uid: 123 } as ComponentInternalInstance

    // Настраиваем моки для этого теста
    vi.mocked(ssrRenderSlotInner).mockImplementation(
      async (_slots, _name, _props, _fallback, _push) => {
        // Ничего не делаем
      },
    )
    vi.mocked(unrollBuffer).mockResolvedValue('result')

    await renderComponentToString(mockSlots, mockCurrentInstance)

    expect(ssrRenderSlotInner).toHaveBeenCalledWith(
      mockSlots,
      'default',
      {},
      null,
      expect.any(Function),
      mockCurrentInstance,
    )
  })
})
