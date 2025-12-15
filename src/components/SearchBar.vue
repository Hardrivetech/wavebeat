<template>
  <form @submit.prevent="performSearch" class="search-bar">
    <input type="text" v-model="query" placeholder="Search for tracks..." />
    <button type="submit">Search</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const query = ref('')
const router = useRouter()

const performSearch = () => {
  if (query.value.trim()) {
    router.push({ name: 'Search', query: { q: query.value.trim() } })
  }
}
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.search-bar input {
  padding: 0.5rem;
  border-radius: 50px;
  border: 1px solid var(--text-secondary);
  background-color: var(--bg-elevation);
  color: var(--text-primary);
  min-width: 250px;
  padding-left: 1rem;
}
.search-bar button {
  display: none; /* We can rely on the user pressing Enter */
}
</style>
