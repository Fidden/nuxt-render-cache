<template>
  <cache-render
    cache-key="photos-list"
    :hard-ttl="10000"
    :soft-ttl="5000"
  >
    <photos-list />
  </cache-render>
</template>

<script setup lang="ts">
import PhotosList from './components/photosList.vue'
</script>
