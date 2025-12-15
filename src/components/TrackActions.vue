<template>
  <div class="track-actions" @click.stop>
    <button @click="toggleMenu" class="menu-button">...</button>
    <div v-if="isOpen" class="menu-content">
      <div @click="emitAction('add-to-queue')" class="menu-item">Add to Queue</div>
      <div @click="emitAction('play-next')" class="menu-item">Play Next</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  track: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['add-to-queue', 'play-next', 'toggle-like']);
const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    // Close menu if clicking outside
    window.addEventListener('click', closeMenu, { once: true });
  }
};

const closeMenu = () => {
  isOpen.value = false;
};

const emitAction = (action) => {
  emit(action, props.track);
  closeMenu();
};
</script>

<style scoped>
.track-actions {
  position: relative;
  margin-left: auto;
}

.menu-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 1rem;
  border-radius: 4px;
}

.menu-button:hover {
  color: var(--text-primary);
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-content {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: var(--bg-elevation);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 10;
  width: 150px;
  overflow: hidden;
}

.menu-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>