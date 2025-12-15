<template>
  <div class="search-bar">
    <form @submit.prevent="handleSearch">
      <input
        type="text"
        v-model="query"
        placeholder="Search for artists, tracks, or albums..."
      />
      <button type="submit">Search</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const query = ref('');
const emit = defineEmits(['search']);

const handleSearch = () => {
  if (query.value.trim()) {
    emit('search', query.value.trim());
  }
};
</script>

<style scoped>
.search-bar {
  margin-bottom: 2rem;
}

form {
  display: flex;
  gap: 0.5rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 50px;
  background-color: var(--bg-elevation);
  color: var(--text-primary);
  border: 1px solid transparent;
}

button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: var(--brand-green);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: bold;
}

button:hover {
  background-color: var(--brand-green-hover);
  transform: scale(1.05);
}
</style>
