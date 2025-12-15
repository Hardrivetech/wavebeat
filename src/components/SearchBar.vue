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
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  border: none;
  background-color: var(--bg-elevation);
  color: var(--text-primary);
  min-width: 300px;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.search-bar input:focus {
  outline: none;
  background-color: #2a2a2a;
}
.search-bar button {
  display: none; /* We can rely on the user pressing Enter */
}
</style>
