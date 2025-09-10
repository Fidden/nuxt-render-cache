/**
 * Интерфейс для работы с кешем
 * Определяет контракт для всех реализаций кеширования
 */
export interface ICache {
  /** Получить данные из кеша по ключу */
  get: (key: string) => Promise<CacheEntry | null>
  /** Сохранить данные в кеш с указанным TTL */
  set: <T = unknown>(key: string, value: CacheEntry, ttl: number) => Promise<T>
  /** Установить блокировку для предотвращения одновременного доступа */
  lock: <T = unknown>(key: string, ttl: number) => Promise<T>
  /** Проверить истек ли TTL для указанного ключа */
  expired: (key: string, ttl: number) => Promise<boolean>
}

/**
 * Структура записи в кеше
 * Содержит закэшированные данные и временную метку создания
 */
export type CacheEntry = {
  /** Закэшированные данные в виде строки (обычно HTML) */
  data: string
  /** Временная метка создания записи в миллисекундах */
  timestamp: number
}
