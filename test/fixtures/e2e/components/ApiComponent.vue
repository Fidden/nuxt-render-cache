<template>
  <div class="api-component">
    <h2>API Component</h2>
    <div v-if="data">
      <p>First post title: {{ data[0]?.title }}</p>
      <p>Total posts: {{ data.length }}</p>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-expect-error - useFetch is auto-imported in Nuxt
const { data } = await useFetch('https://jsonplaceholder.typicode.com/posts')
</script>
