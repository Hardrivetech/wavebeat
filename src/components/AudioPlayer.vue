<template>
  <div class="audio-player" v-if="track && audioSrc">
    <div class="player-info">
      <img :src="track.artwork['150x150']" alt="Current track artwork" />
      <div>
        <div class="player-title">{{ track.title }}</div>
        <router-link
          :to="{ name: 'Artist', params: { handle: track.user.handle } }"
          class="player-artist"
          @click.stop
        >
          {{ track.user.name }}
        </router-link>
      </div>
      <button
        :class="['like-button', { 'is-liked': isLiked }]"
        @click="$emit('toggle-like', track)"
      >
        ♥
      </button>
    </div>

    <div class="player-center">
      <div class="player-controls">
        <button
          :class="['control-button', { 'is-active': isShuffleActive }]"
          @click="$emit('toggle-shuffle')"
          title="Shuffle"
        >
          🔀
        </button>
        <button @click="$emit('play-previous')" class="control-button">⏮</button>
        <button @click="togglePlayPause" class="control-button play-button">
          {{ isPlaying ? '❚❚' : '▶' }}
        </button>
        <button @click="$emit('play-next')" class="control-button">⏭</button>
        <button
          @click="$emit('cycle-repeat')"
          class="control-button"
          :class="{ 'is-active': repeatMode !== 'off' }"
          :title="`Repeat: ${repeatMode}`"
        >
          <span v-if="repeatMode === 'one'" class="repeat-one">1</span>🔁
        </button>
      </div>
      <div class="playback-bar">
        <span class="time-display">{{ formatTime(currentTime) }}</span>
        <input
          type="range"
          class="seek-bar"
          :value="currentTime"
          :max="duration"
          @input="seek"
          :style="{ backgroundSize: `${(currentTime / duration) * 100 || 0}% 100%` }"
        />
        <span class="time-display">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <div class="player-right">
      <button @click="$emit('toggle-queue')" class="control-button" title="Queue">☰</button>
      <div class="volume-control">
        <span class="volume-icon" @click="toggleMute">{{ volume > 0 ? '🔊' : '🔇' }}</span>
        <input
          type="range"
          class="volume-slider"
          min="0"
          max="1"
          step="0.01"
          :value="volume"
          @input="changeVolume"
          :style="{ backgroundSize: `${volume * 100}% 100%` }"
        />
      </div>
    </div>
  </div>
  <audio
    :src="audioSrc"
    autoplay
    ref="audioElement"
    :loop="repeatMode === 'one'"
    @ended="$emit('track-ended')"
  ></audio>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'

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
    default: () => [],
  },
  isShuffleActive: {
    type: Boolean,
    default: false,
  },
  repeatMode: {
    type: String,
    default: 'off', // 'off', 'all', 'one'
  },
})

defineEmits([
  'play-next',
  'play-previous',
  'track-ended',
  'toggle-like',
  'toggle-shuffle',
  'cycle-repeat',
  'toggle-queue',
  'update:volume',
])

const isLiked = computed(() => props.track && props.likedTrackIds.includes(props.track.id))

const audioElement = ref(null)

// When the audio source changes, load and play the new track
watch(
  () => props.audioSrc,
  (newSrc) => {
    if (audioElement.value && newSrc) {
      audioElement.value.load()
      audioElement.value.play().catch((e) => console.error('Autoplay was prevented.', e))
    }
  },
)

// --- Custom Controls State ---
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const lastVolume = ref(1)

onMounted(() => {
  const player = audioElement.value
  if (player) {
    // Load saved volume
    const savedVolume = localStorage.getItem('wavebeat_volume')
    if (savedVolume !== null) {
      volume.value = parseFloat(savedVolume)
      player.volume = volume.value
    }

    player.addEventListener('timeupdate', () => {
      currentTime.value = player.currentTime
    })
    player.addEventListener('loadedmetadata', () => {
      duration.value = player.duration
    })
    player.addEventListener('play', () => {
      isPlaying.value = true
    })
    player.addEventListener('pause', () => {
      isPlaying.value = false
    })
  }
})

const togglePlayPause = () => {
  if (isPlaying.value) {
    audioElement.value?.pause()
  } else {
    audioElement.value?.play()
  }
}

const seek = (event) => {
  const time = parseFloat(event.target.value)
  if (audioElement.value) {
    audioElement.value.currentTime = time
    currentTime.value = time
  }
}

const changeVolume = (event) => {
  const newVolume = parseFloat(event.target.value)
  volume.value = newVolume
  if (audioElement.value) audioElement.value.volume = newVolume
  localStorage.setItem('wavebeat_volume', newVolume.toString())
}

const toggleMute = () => {
  if (volume.value > 0) {
    lastVolume.value = volume.value
    changeVolume({ target: { value: 0 } })
  } else {
    changeVolume({ target: { value: lastVolume.value } })
  }
}

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.audio-player {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #181818;
  border-top: 1px solid var(--bg-elevation);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 30%;
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
  text-decoration: none;
}

.player-artist:hover {
  text-decoration: underline;
}

.player-center {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 40%;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
}

.like-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  margin-left: 1rem;
  transition:
    color 0.2s,
    transform 0.2s;
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

.play-button {
  background-color: var(--text-primary);
  color: var(--bg-secondary);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  line-height: 1;
}

.play-button:hover {
  transform: scale(1.1);
  background-color: var(--brand-green);
  color: var(--text-primary);
}

.control-button:hover {
  color: var(--text-primary);
}

.control-button.is-active {
  color: var(--brand-green);
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
  transform: translate(8px, -8px);
}

.playback-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.time-display {
  font-size: 0.8rem;
  color: var(--text-secondary);
  min-width: 40px;
  text-align: center;
}

/* --- Custom Range Slider Styles --- */
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
}

input[type='range']:focus {
  outline: none;
}

/* Track */
input[type='range']::-webkit-slider-runnable-track {
  background-color: #535353;
  border-radius: 0.5rem;
  height: 4px;
}
input[type='range']::-moz-range-track {
  background-color: #535353;
  border-radius: 0.5rem;
  height: 4px;
}

/* Thumb */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  margin-top: -4px; /* Centers thumb on the track */
  background-color: var(--text-primary);
  border-radius: 50%;
  height: 12px;
  width: 12px;
  opacity: 0; /* Hide by default */
  transition: opacity 0.2s;
}

/* Background fill for progress */
.seek-bar,
.volume-slider {
  background-image: linear-gradient(var(--brand-green), var(--brand-green));
  background-repeat: no-repeat;
}

.playback-bar:hover .seek-bar::-webkit-slider-thumb,
.volume-control:hover .volume-slider::-webkit-slider-thumb {
  opacity: 1;
}

.player-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  width: 30%;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.volume-icon {
  cursor: pointer;
  font-size: 1.2rem;
}

.volume-slider {
  width: 100px;
}

/* Hide the audio element now that we have custom controls */
audio {
  display: none;
}
</style>
