<template>
  <div class="audio-player" v-if="track && audioSrc">
    <div class="player-info">
      <img :src="track.artwork['150x150']" alt="Current track artwork" />
      <div>
        <div class="player-title">{{ track.title }}</div>
        <div class="player-artist">{{ track.user.name }}</div>
      </div>
      <button 
        :class="['like-button', { 'is-liked': isLiked }]" 
        @click="$emit('toggle-like', track)"
      >♥</button>
    </div>
    <div class="player-controls">
        <button 
            :class="['control-button', { 'is-active': isShuffleActive }]"
            @click="$emit('toggle-shuffle')"
            title="Shuffle"
        >🔀</button>
        <button @click="$emit('play-previous')" class="control-button">⏮</button>
        <audio 
            controls 
            :src="audioSrc" 
            autoplay 
            ref="audioElement"
            :loop="repeatMode === 'one'"
            @ended="$emit('track-ended')"
        ></audio>
        <button @click="$emit('play-next')" class="control-button">⏭</button>
        <button @click="$emit('cycle-repeat')" class="control-button is-active" :title="`Repeat: ${repeatMode}`">
            <span v-if="repeatMode === 'one'" class="repeat-one">1</span>🔁
        </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  track: {
    type: Object,
    default: null,
  },
  audioSrc: {
    type: String,
    default: '',
  },
  likedTrackIds: {
    type: Array,
    default: () => []
  },
  isShuffleActive: {
    type: Boolean,
    default: false
  },
  repeatMode: {
    type: String,
    default: 'off' // 'off', 'all', 'one'
  }
});

const emit = defineEmits([
    'play-next', 'play-previous', 'track-ended', 'toggle-like', 'toggle-shuffle', 'cycle-repeat'
]);

const isLiked = computed(() => props.track && props.likedTrackIds.includes(props.track.id));

const audioElement = ref(null);

// When the audio source changes, load and play the new track
watch(() => props.audioSrc, (newSrc) => {
  if (audioElement.value && newSrc) {
    audioElement.value.load();
    audioElement.value.play();
  }
});
</script>

<style scoped>
.audio-player {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--bg-elevation);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
}

.player-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.player-info img {
    width: 60px;
    height: 60px;
    border-radius: 4px;
}

.player-title {
    font-weight: bold;
    color: var(--text-primary);
}

.player-artist {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

audio {
  width: 100%;
  filter: invert(1) sepia(0.5) saturate(5) hue-rotate(100deg);
}

.player-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 50%;
    justify-content: center;
}

.like-button {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.5rem;
    cursor: pointer;
    margin-left: 1rem;
    transition: color 0.2s, transform 0.2s;
}

.like-button:hover {
    color: var(--text-primary);
}

.like-button.is-liked {
    color: var(--brand-green);
    transform: scale(1.1);
}

.control-button {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.5rem;
    cursor: pointer;
    transition: color 0.2s;
}
.control-button:hover {
    color: var(--text-primary);
}

.control-button.is-active {
    color: var(--brand-green);
}

.control-button[title^="Repeat: off"] {
    color: var(--text-secondary);
}

.repeat-one {
    position: absolute;
    font-size: 0.7rem;
    font-weight: bold;
    color: var(--bg-secondary);
    background: var(--brand-green);
    border-radius: 50%;
    width: 12px;
    height: 12px;
    line-height: 12px;
    text-align: center;
    top: 5px;
    right: 5px;
}
</style>
