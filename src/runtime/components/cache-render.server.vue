<!--
  Серверная версия компонента CacheRender

  Выполняет рендеринг дочерних компонентов с кешированием на стороне сервера.
  Использует useRenderCache для реализации двухуровневого кеширования.

  При первом рендере компонент блокируется до завершения рендеринга,
  последующие запросы обслуживаются из кеша.

  @props
  cacheKey - Уникальный ключ для идентификации кешированного контента
  hardTtl - Время жизни кеша в секундах до полного истечения
  softTtl - Время жизни кеша в секундах до фонового обновления
-->
<template>
  <div
    class="cache-render"
    v-html="renderedString"
  />
</template>

<script setup lang="ts">
import { getCurrentInstance, ref, useSlots } from 'vue'
import { useRenderCache } from '../composables/useRenderCache'
import type { ICacheRenderProps } from './cache-render.const'

const props = defineProps<ICacheRenderProps>()

const slots = useSlots()
const currentInstance = getCurrentInstance()
const renderCache = useRenderCache({
  cacheKey: props.cacheKey,
  hardTtl: props.hardTtl,
  softTtl: props.softTtl,
  cacheTags: props.cacheTags ?? [],
})
const renderedString = ref('')

renderedString.value = await renderCache.render(slots, currentInstance!)
</script>
