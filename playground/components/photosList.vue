<template>
  <div>
    {{ data }}
  </div>
</template>

<script setup lang="ts">
const { data } = useFetch('https://jsonplaceholder.typicode.com/photos')
</script>
