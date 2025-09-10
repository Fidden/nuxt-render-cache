import { describe, expect, it } from 'vitest'
import { unrollBuffer } from '../buffer'

describe('развертывание буфера', () => {
  it('должен возвращать пустую строку для пустого массива', async () => {
    const result = await unrollBuffer([])
    expect(result).toBe('')
  })

  it('должен конкатенировать строки из массива', async () => {
    const result = await unrollBuffer(['hello', ' ', 'world'])
    expect(result).toBe('hello world')
  })

  it('должен обрабатывать промисы, которые разрешаются в строки', async () => {
    const promises = [Promise.resolve('first'), ' ', Promise.resolve('second')]
    const result = await unrollBuffer(promises)
    expect(result).toBe('first second')
  })

  it('должен обрабатывать вложенные массивы', async () => {
    const nested = ['a', ['b', 'c'], 'd']
    const result = await unrollBuffer(nested)
    expect(result).toBe('abcd')
  })

  it('должен обрабатывать промисы, которые разрешаются в массивы', async () => {
    const complex = [Promise.resolve(['hello', ' ']), 'world']
    const result = await unrollBuffer(complex)
    expect(result).toBe('hello world')
  })

  it('должен обрабатывать глубоко вложенные структуры', async () => {
    const deep = [
      'start',
      [Promise.resolve('middle'), ['deep', Promise.resolve(['nested'])]],
      'end',
    ]
    const result = await unrollBuffer(deep)
    expect(result).toBe('startmiddledeepnestedend')
  })

  it('должен обрабатывать смешанные типы с промисами и вложенными массивами', async () => {
    const mixed = [
      Promise.resolve('async'),
      ' ',
      ['sync', ' '],
      Promise.resolve(['promise', ' ']),
      'done',
    ]
    const result = await unrollBuffer(mixed)
    expect(result).toBe('async sync promise done')
  })

  it('должен обрабатывать одиночную строку', async () => {
    const result = await unrollBuffer(['single'])
    expect(result).toBe('single')
  })

  it('должен обрабатывать одиночный промис', async () => {
    const result = await unrollBuffer([Promise.resolve('promise')])
    expect(result).toBe('promise')
  })

  it('должен обрабатывать массив с числами (преобразовывать в строку)', async () => {
    const result = await unrollBuffer(['number: ', 42])
    expect(result).toBe('number: 42')
  })

  it('должен обрабатывать массив с булевыми значениями', async () => {
    const result = await unrollBuffer(['bool: ', true, ' ', false])
    expect(result).toBe('bool: true false')
  })

  it('должен обрабатывать массив с null и undefined', async () => {
    const result = await unrollBuffer([
      'null: ',
      null,
      ' undefined: ',
      undefined,
    ])
    expect(result).toBe('null: null undefined: undefined')
  })

  it('должен обрабатывать промисы, которые разрешаются в разные типы', async () => {
    const promises = [
      Promise.resolve(123),
      Promise.resolve(true),
      Promise.resolve(null),
    ]
    const result = await unrollBuffer(promises)
    expect(result).toBe('123truenull')
  })

  it('должен обрабатывать отклоненные промисы', async () => {
    const promises = [
      'start ',
      Promise.reject(new Error('test error')),
      ' end',
    ]

    await expect(unrollBuffer(promises)).rejects.toThrow('test error')
  })

  it('должен обрабатывать элементы по порядку', async () => {
    const order: string[] = []
    const promises = [
      Promise.resolve().then(() => {
        order.push('first')
        return 'A'
      }),
      Promise.resolve().then(() => {
        order.push('second')
        return 'B'
      }),
      'C',
    ]

    const result = await unrollBuffer(promises)
    expect(result).toBe('ABC')
    expect(order).toEqual(['first', 'second'])
  })
})
