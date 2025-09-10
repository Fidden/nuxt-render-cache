export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  nitro: {
    preset: 'nodeCluster',
  },
})
