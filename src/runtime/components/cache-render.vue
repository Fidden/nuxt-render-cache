<!--
  Компонент для рендеринга с кешированием

  Универсальный компонент-обертка, который автоматически выбирает
  подходящую реализацию (серверную или клиентскую) в зависимости
  от среды выполнения.

  На сервере использует server-side рендеринг с кешированием,
  на клиенте просто проксирует содержимое без дополнительной логики.

  @example
  ```vue
  <template>
    <CacheRender
      cache-key="page:home"
      :hard-ttl="300"
      :soft-ttl="60"
    >
      <div>
        <h1>Главная страница</h1>
        <p>Динамический контент...</p>
      </div>
    </CacheRender>
  </template>
  ```
-->
<template>
  <component
    :is="toRender"
    v-bind="props"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { ICacheRenderProps } from './cache-render.const'

const props = defineProps<ICacheRenderProps>()

const CacheRenderServer = defineAsyncComponent(
  () => import('./cache-render.server.vue'),
)
const CacheRenderClient = defineAsyncComponent(
  () => import('./cache-render.client.vue'),
)

const toRender = computed(() => {
  return import.meta.server ? CacheRenderServer : CacheRenderClient
})
</script>
