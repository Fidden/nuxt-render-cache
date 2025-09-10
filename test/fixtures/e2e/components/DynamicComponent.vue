<template>
  <div class="dynamic-component">
    <h2>Dynamic Component</h2>
    <p>Timestamp: {{ timestamp }}</p>
    <p>Counter: {{ counter }}</p>
    <p>Hash: {{ hash }}</p>
  </div>
</template>

<script setup lang="ts">
const timestamp = Date.now()
const counter = Math.floor(Math.random() * 1000)
const hash = Math.random().toString(36).substring(2, 15)
</script>
