import { describe, expect, it } from 'vitest'
import { isPromise } from '../promise'

describe('является ли промисом', () => {
  it('должен возвращать true для нативных экземпляров Promise', () => {
    const promise = new Promise(resolve => resolve('test'))
    expect(isPromise(promise)).toBe(true)
  })

  it('должен возвращать true для разрешенных промисов', () => {
    const promise = Promise.resolve('test')
    expect(isPromise(promise)).toBe(true)
  })

  it('должен возвращать true для отклоненных промисов', async () => {
    const promise = Promise.reject(new Error('test'))
    expect(isPromise(promise)).toBe(true)
    // Handle the rejection to avoid unhandled promise rejection
    await promise.catch(() => {})
  })

  it('должен возвращать true для ожидающих промисов', () => {
    const promise = new Promise(() => {})
    expect(isPromise(promise)).toBe(true)
  })

  it('должен возвращать false для null', () => {
    expect(isPromise(null)).toBe(false)
  })

  it('должен возвращать false для undefined', () => {
    expect(isPromise(undefined)).toBe(false)
  })

  it('должен возвращать false для примитивных значений', () => {
    expect(isPromise(42)).toBe(false)
    expect(isPromise('string')).toBe(false)
    expect(isPromise(true)).toBe(false)
    expect(isPromise(Symbol('test'))).toBe(false)
    expect(isPromise(BigInt(123))).toBe(false)
  })

  it('должен возвращать false для обычных объектов', () => {
    expect(isPromise({})).toBe(false)
    expect(isPromise({ key: 'value' })).toBe(false)
  })

  it('должен возвращать false для массивов', () => {
    expect(isPromise([])).toBe(false)
    expect(isPromise([1, 2, 3])).toBe(false)
  })

  it('должен возвращать false для функций', () => {
    expect(isPromise(() => {})).toBe(false)
    expect(isPromise(function () {})).toBe(false)
  })

  it('должен возвращать false для объектов с then свойством, которое не является функцией', () => {
    const objWithThen = { then: 'not a function' }
    expect(isPromise(objWithThen)).toBe(false)
  })

  it('должен возвращать false для объектов с then свойством как null', () => {
    const objWithNullThen = { then: null }
    expect(isPromise(objWithNullThen)).toBe(false)
  })

  it('должен возвращать false для объектов с then свойством как undefined', () => {
    const objWithUndefinedThen = { then: undefined }
    expect(isPromise(objWithUndefinedThen)).toBe(false)
  })

  it('должен возвращать false для объектов с then свойством как число', () => {
    const objWithNumberThen = { then: 123 }
    expect(isPromise(objWithNumberThen)).toBe(false)
  })

  it('должен возвращать true для объектов, имитирующих интерфейс Promise (thenable)', () => {
    const thenable = {
      then: (resolve: (value: string) => void) => resolve('test'),
    }
    expect(isPromise(thenable)).toBe(true)
  })

  it('должен возвращать true для пользовательских классов, похожих на Promise', () => {
    class CustomPromise {
      then(resolve: (value: string) => void) {
        resolve('test')
      }
    }

    const customPromise = new CustomPromise()
    expect(isPromise(customPromise)).toBe(true)
  })

  it('должен возвращать false для объектов без then свойства', () => {
    const objWithoutThen = { other: 'property' }
    expect(isPromise(objWithoutThen)).toBe(false)
  })

  it('должен обрабатывать объекты с цепочкой прототипов, содержащей then', () => {
    const obj = {} as Record<string, unknown>
    Object.setPrototypeOf(obj, {
      then: () => {},
    })
    expect(isPromise(obj)).toBe(true)
  })

  it('должен возвращать false для объектов Date', () => {
    expect(isPromise(new Date())).toBe(false)
  })

  it('должен возвращать false для объектов RegExp', () => {
    expect(isPromise(/test/)).toBe(false)
    expect(isPromise(/abc/i)).toBe(false)
  })

  it('должен возвращать false для объектов Map и Set', () => {
    expect(isPromise(new Map())).toBe(false)
    expect(isPromise(new Set())).toBe(false)
  })
})
