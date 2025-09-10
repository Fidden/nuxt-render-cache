<template>
  <div class="no-cache-component">
    <h2>No Cache Component</h2>
    <p>Always fresh timestamp: {{ timestamp }}</p>
    <p>Always fresh random: {{ random }}</p>
  </div>
</template>

<script setup lang="ts">
const timestamp = Date.now()
const random = Math.random()
</script>
