<template>
  <div :class="['queue-panel-overlay', { 'is-visible': isVisible }]" @click="$emit('close')">
    <div :class="['queue-panel', { 'is-visible': isVisible }]" @click.stop>
      <div class="queue-header">
        <h3>Up Next</h3>
        <button @click="$emit('close')" class="close-button">&times;</button>
      </div>
      <div class="queue-list">
        <div
          v-for="(track, index) in queue"
          :key="track.id + '-' + index"
          :class="['queue-item', { 'is-active': isCurrentTrack(track, index) }]"
          @click="$emit('play-from-queue', index)"
        >
          <img :src="track.artwork['150x150']" alt="Track artwork" />
          <div class="track-details">
            <div class="track-title">{{ track.title }}</div>
            <div class="track-artist">{{ track.user.name }}</div>
          </div>
        </div>
        <div v-if="queue.length === 0" class="empty-queue">The queue is empty.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  queue: {
    type: Array,
    required: true,
  },
  currentTrack: {
    type: Object,
    default: null,
  },
  currentQueueIndex: {
    type: Number,
    default: -1,
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close', 'play-from-queue'])

const isCurrentTrack = (track, index) => {
  return (
    props.currentTrack && props.currentTrack.id === track.id && props.currentQueueIndex === index
  )
}
</script>

<style scoped>
.queue-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s ease,
    visibility 0.3s;
  z-index: 999;
}
.queue-panel-overlay.is-visible {
  opacity: 1;
  visibility: visible;
}
.queue-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100%;
  background-color: var(--bg-secondary);
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.5);
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}
.queue-panel.is-visible {
  transform: translateX(0);
}
.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--bg-elevation);
}
.close-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 2rem;
  cursor: pointer;
}
.queue-list {
  overflow-y: auto;
  flex-grow: 1;
}
.queue-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  border-bottom: 1px solid var(--bg-elevation);
}
.queue-item:hover {
  background-color: var(--bg-elevation);
}
.queue-item.is-active {
  background-color: var(--bg-elevation);
  border-left: 3px solid var(--brand-green);
  padding-left: calc(1.5rem - 3px);
}
.queue-item img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}
.track-title {
  font-size: 0.9rem;
  color: var(--text-primary);
}
.track-artist {
  font-size: 0.8rem;
  color: var(--text-secondary);
}
.empty-queue {
  color: var(--text-secondary);
  text-align: center;
  padding: 2rem;
}
</style>
