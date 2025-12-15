<template>
  <div class="horizontal-track-list-container">
    <div class="track-grid">
      <div
        v-for="track in tracks"
        :key="track.id"
        class="track-card"
        @click="$emit('play-track', track)"
      >
        <div class="track-artwork">
          <img :src="track.artwork['150x150']" :alt="track.title" />
          <button
            class="play-button"
            @click.stop="$emit('play-track', track)"
            aria-label="Play Track"
          >
            ▶
          </button>
        </div>
        <div class="track-title">{{ track.title }}</div>
        <div class="track-artist">{{ track.user.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tracks: {
    type: Array,
    required: true,
  },
})

defineEmits(['play-track'])
</script>

<style scoped>
.horizontal-track-list-container {
  margin-bottom: 2rem;
}
.track-grid {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem; /* For scrollbar */
}
.track-grid::-webkit-scrollbar {
  display: none; /* Hide scrollbar for a cleaner look */
}
.track-card {
  background-color: #181818;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 180px;
  flex-shrink: 0;
}
.track-card:hover {
  background-color: var(--bg-elevation);
}
.track-artwork {
  width: 100%;
  padding-bottom: 100%; /* 1:1 Aspect Ratio */
  position: relative;
  background-color: #333;
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow: hidden;
}
.track-artwork img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.play-button {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  background-color: var(--brand-green);
  color: black;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.2s ease-out;
}
.track-card:hover .play-button {
  opacity: 1;
  transform: translateY(0);
}
.track-title {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.track-artist {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
</style>
