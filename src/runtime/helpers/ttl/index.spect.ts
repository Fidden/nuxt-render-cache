import { describe, expect, it } from 'vitest'
import { ttlToNumber } from '../ttl'

describe('ttlToNumber', () => {
  describe('корректное преобразование единиц времени', () => {
    it('должен преобразовывать секунды', () => {
      expect(ttlToNumber('30s')).toBe(30)
      expect(ttlToNumber('1s')).toBe(1)
      expect(ttlToNumber('120s')).toBe(120)
    })

    it('должен преобразовывать минуты', () => {
      expect(ttlToNumber('5m')).toBe(300) // 5 * 60
      expect(ttlToNumber('1m')).toBe(60)
      expect(ttlToNumber('30m')).toBe(1800) // 30 * 60
    })

    it('должен преобразовывать часы', () => {
      expect(ttlToNumber('2h')).toBe(7200) // 2 * 3600
      expect(ttlToNumber('1h')).toBe(3600)
      expect(ttlToNumber('24h')).toBe(86400) // 24 * 3600
    })

    it('должен преобразовывать дни', () => {
      expect(ttlToNumber('1d')).toBe(86400) // 1 * 86400
      expect(ttlToNumber('7d')).toBe(604800) // 7 * 86400
      expect(ttlToNumber('30d')).toBe(2592000) // 30 * 86400
    })
  })

  describe('обработка ошибок', () => {
    it('должен выбрасывать ошибку при пустой строке', () => {
      expect(() => ttlToNumber('')).toThrow('TTL должен быть непустой строкой')
    })

    it('должен выбрасывать ошибку при передаче не строки', () => {
      // @ts-expect-error - тестируем передачу некорректного типа
      expect(() => ttlToNumber(null)).toThrow(
        'TTL должен быть непустой строкой',
      )
      // @ts-expect-error - тестируем передачу некорректного типа
      expect(() => ttlToNumber(undefined)).toThrow(
        'TTL должен быть непустой строкой',
      )
      // @ts-expect-error - тестируем передачу некорректного типа
      expect(() => ttlToNumber(123)).toThrow(
        'TTL должен быть непустой строкой',
      )
    })

    it('должен выбрасывать ошибку при некорректном формате', () => {
      expect(() => ttlToNumber('abc')).toThrow(
        'Некорректный формат TTL: "abc". Ожидается формат "число + единица" (s/m/h/d), например: "5m", "2h"',
      )
      expect(() => ttlToNumber('5')).toThrow(
        'Некорректный формат TTL: "5". Ожидается формат "число + единица" (s/m/h/d), например: "5m", "2h"',
      )
      expect(() => ttlToNumber('m5')).toThrow(
        'Некорректный формат TTL: "m5". Ожидается формат "число + единица" (s/m/h/d), например: "5m", "2h"',
      )
      expect(() => ttlToNumber('5m30s')).toThrow(
        'Некорректный формат TTL: "5m30s". Ожидается формат "число + единица" (s/m/h/d), например: "5m", "2h"',
      )
    })

    it('должен выбрасывать ошибку при нулевом значении', () => {
      expect(() => ttlToNumber('0s')).toThrow(
        'Значение TTL должно быть положительным числом, получено: 0',
      )
      expect(() => ttlToNumber('0m')).toThrow(
        'Значение TTL должно быть положительным числом, получено: 0',
      )
      expect(() => ttlToNumber('0h')).toThrow(
        'Значение TTL должно быть положительным числом, получено: 0',
      )
      expect(() => ttlToNumber('0d')).toThrow(
        'Значение TTL должно быть положительным числом, получено: 0',
      )
    })

    it('должен выбрасывать ошибку при некорректном формате для отрицательных чисел', () => {
      expect(() => ttlToNumber('-5m')).toThrow(
        'Некорректный формат TTL: "-5m". Ожидается формат "число + единица" (s/m/h/d), например: "5m", "2h"',
      )
      expect(() => ttlToNumber('-1h')).toThrow(
        'Некорректный формат TTL: "-1h". Ожидается формат "число + единица" (s/m/h/d), например: "5m", "2h"',
      )
    })

    it('должен выбрасывать ошибку при некорректном формате для неизвестных единиц времени', () => {
      expect(() => ttlToNumber('5w')).toThrow(
        'Некорректный формат TTL: "5w". Ожидается формат "число + единица" (s/m/h/d), например: "5m", "2h"',
      )
      expect(() => ttlToNumber('10y')).toThrow(
        'Некорректный формат TTL: "10y". Ожидается формат "число + единица" (s/m/h/d), например: "5m", "2h"',
      )
      expect(() => ttlToNumber('2x')).toThrow(
        'Некорректный формат TTL: "2x". Ожидается формат "число + единица" (s/m/h/d), например: "5m", "2h"',
      )
    })
  })

  describe('граничные случаи', () => {
    it('должен корректно обрабатывать большие числа', () => {
      expect(ttlToNumber('999999d')).toBe(999999 * 86400)
      expect(ttlToNumber('1000000s')).toBe(1000000)
    })

    it('должен корректно обрабатывать минимально допустимые значения', () => {
      expect(ttlToNumber('1s')).toBe(1)
      expect(ttlToNumber('1m')).toBe(60)
      expect(ttlToNumber('1h')).toBe(3600)
      expect(ttlToNumber('1d')).toBe(86400)
    })
  })
})
