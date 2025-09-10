<template>
  <div class="simple-component">
    <h2>Simple Component</h2>
    <p>Rendered at: {{ renderTime }}</p>
    <p>Random value: {{ randomValue }}</p>
  </div>
</template>

<script setup lang="ts">
const renderTime = new Date().toISOString()
const randomValue = Math.random()
</script>
