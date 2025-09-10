---
seo:
  title: Nuxt Render Cache - Документация
  description: Мощная библиотека для кеширования рендеринга компонентов в Nuxt 3 приложениях. Решение для высокопроизводительных SSR приложений с умным кешированием.
---

::u-page-hero
#title
Nuxt Render Cache

#description
Мощная библиотека для кеширования рендеринга Vue компонентов в Nuxt 3 приложениях. Решает проблемы производительности SSR с помощью гибкой системы кеширования, поддерживающей TTL, блокировки и распределенные серверы.

#links
:::u-button

---

color: neutral
size: xl
to: /getting-started/installation
trailing-icon: i-lucide-arrow-right

---

Быстрый старт
:::

:::u-button

---

color: neutral
icon: simple-icons-github
size: xl
to: https://github.com/Fidden/nuxt-render-cache
variant: outline

---

GitHub
:::
::

::u-page-section
#title
Ключевые возможности

#features
:::u-page-feature

---

icon: i-heroicons-cpu-chip

---

#title
Двухуровневое TTL кеширование

#description
Soft TTL для фонового обновления и Hard TTL для полного истечения кеша. Пользователи получают контент мгновенно, обновление происходит без блокировки.
:::

:::u-page-feature

---

icon: i-heroicons-server-stack

---

#title
Распределенное кеширование

#description
Redis-based решение с поддержкой кластеров и Pub/Sub синхронизацией. Идеально для масштабируемых приложений с несколькими серверами.
:::

:::u-page-feature

---

icon: i-heroicons-lock-closed

---

#title
Умные блокировки

#description
Предотвращает одновременный рендеринг одного контента несколькими процессами. Оптимизирует использование ресурсов и производительность.
:::

:::u-page-feature

---

icon: i-heroicons-wrench-screwdriver

---

#title
REST API управление

#description
Полный контроль над кешем через REST API. Управление ключами, статистика, инвалидация по тегам и полная очистка кеша.
:::

:::u-page-feature

---

icon: i-heroicons-chart-bar

---

#title
Детальный мониторинг

#description
Встроенная система логирования и метрик. API для получения статистики Redis, списка ключей и детальной информации о производительности.
:::

:::u-page-feature

---

icon: i-heroicons-tag

---

#title
Тегирование и инвалидация

#description
Гибкая система тегов для групповой инвалидации кеша. Легко очищать связанные данные при изменении контента или структуры.
:::
::

::u-page-section
#title
Быстрый старт

#description
Начните использовать Nuxt Render Cache за 3 простых шага

#steps
:::u-step

---

step: 1

---

#title
Установка

#description
Установите библиотеку через npm или yarn

```bash
npm install nuxt-render-cache
# или
yarn add nuxt-render-cache
```

:::

:::u-step

---

step: 2

---

#title
Настройка

#description
Добавьте модуль в nuxt.config.ts

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-render-cache'],
  renderCache: {
    ttl: {
      softDefault: 60, // 1 минута фонового обновления
      hardDefault: 300, // 5 минут полного кеша
      renderTimeout: 10000, // 10 секунд таймаут
    },
  },
});
```

:::

:::u-step

---

step: 3

---

#title
Использование

#description
Оберните компоненты в CacheRender

```vue
<template>
  <CacheRender
    cache-key="page:home"
    :hard-ttl="300"
    :soft-ttl="60"
    :cache-tags="['page', 'home']"
  >
    <div>
      <h1>Главная страница</h1>
      <ExpensiveComponent />
      <AsyncDataComponent />
    </div>
  </CacheRender>
</template>
```

:::
::
