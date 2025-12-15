<template>
  <div class="track-list">
    <h2 v-if="tracks.length > 0">{{ title }}</h2>
    <div v-if="tracks.length === 0 && (hasSearched || !title)" class="no-results">
      No results found.
    </div>
    <div
      v-for="(track, index) in tracks"
      :key="track.id"
      class="track-item"
      @click="playTrack(track, index)"
    >
      <div class="track-play-section">
        <img :src="track.artwork['150x150']" alt="Track artwork" />
        <div class="play-icon">▶</div>
      </div>
      <div class="track-details">
        <div class="track-title">{{ track.title }}</div>
        <div class="track-artist">{{ track.user.name }}</div>
      </div>
      <div class="track-duration">
        {{ formatDuration(track.duration) }}
      </div>
      <button 
        :class="['like-button', { 'is-liked': isLiked(track.id) }]" 
        @click.stop="$emit('toggle-like', track)"
      >
        ♥
      </button>
      <TrackActions :track="track" @add-to-queue="$emit('add-to-queue', track)" @play-next="$emit('play-next', track)" />
    </div>
  </div>
</template>

<script setup>
import TrackActions from './TrackActions.vue';

const props = defineProps({
  tracks: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    default: ''
  },
  hasSearched: {
    type: Boolean,
    default: false,
  },
  likedTrackIds: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['play-track', 'add-to-queue', 'play-next', 'toggle-like']);

const isLiked = (trackId) => {
  return props.likedTrackIds.includes(trackId);
};

const playTrack = (track, index) => {
  emit('play-track', { track, index });
};

const formatDuration = (seconds) => {
  if (isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.track-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.track-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.track-item:hover {
  background-color: var(--bg-elevation);
}

.track-item:hover .play-icon {
  opacity: 1;
}

.track-item:hover img {
  opacity: 0.4;
}

.track-play-section {
  position: relative;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1.5rem;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none; /* So it doesn't interfere with the click */
}

.track-play-section img {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  transition: opacity 0.2s;
}

.track-details {
  overflow: hidden;
  flex-grow: 1;
}

.track-title {
  font-weight: bold;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.track-duration {
  color: var(--text-secondary);
  font-size: 0.9rem;  
  padding-right: 1rem;
}

.like-button {
    background: none;
    border: none;
    color: transparent; /* Hide by default */
    font-size: 1.2rem;
    cursor: pointer;
    transition: color 0.2s;
    margin-left: auto;
}

/* Show on hover or if liked */
.track-item:hover .like-button,
.like-button.is-liked {
    color: var(--text-secondary);
}

.like-button.is-liked {
    color: var(--brand-green);
}

.no-results {
    color: var(--text-secondary);
    text-align: center;
    grid-column: 1 / -1; /* Span all columns */
}
</style>
