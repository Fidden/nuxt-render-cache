<template>
  <div>
    <h1>E2E Test App</h1>

    <!-- Тест 1: Простой компонент с кешированием -->
    <cache-render
      cache-key="simple-test"
      :cache-tags="['simple']"
      :hard-ttl="10000"
      :soft-ttl="5000"
    >
      <simple-component />
    </cache-render>

    <!-- Тест 2: Компонент с API данными -->
    <cache-render
      cache-key="api-test"
      :cache-tags="['api']"
      :hard-ttl="15000"
      :soft-ttl="8000"
    >
      <api-component />
    </cache-render>

    <!-- Тест 3: Компонент с динамическими данными -->
    <cache-render
      cache-key="dynamic-test"
      :cache-tags="['dynamic']"
      :hard-ttl="20000"
      :soft-ttl="10000"
    >
      <dynamic-component />
    </cache-render>

    <!-- Тест 4: Компонент без кеширования для сравнения -->
    <no-cache-component />
  </div>
</template>

<script setup lang="ts">
import ApiComponent from './components/ApiComponent.vue'
import DynamicComponent from './components/DynamicComponent.vue'
import NoCacheComponent from './components/NoCacheComponent.vue'
import SimpleComponent from './components/SimpleComponent.vue'
</script>
