<template>
  <div class="liked-songs-view">
    <h1>💚 Liked Songs</h1>
    <TrackListSkeleton v-if="isLoading" :count="10" :show-title="false" />
    <TrackList
      v-else
      :tracks="likedTracks"
      :liked-track-ids="likedTrackIds"
      @play-track="playFromList($event)"
      @add-to-queue="emit('add-to-queue', $event)"
      @play-next="emit('play-next', $event)"
      @toggle-like="emit('toggle-like', $event)"
      @add-to-playlist="emit('add-to-playlist', $event)"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import TrackList from '../components/TrackList.vue'
import TrackListSkeleton from '../components/TrackListSkeleton.vue'

const props = defineProps({
  likedTrackIds: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'play-from-list',
  'add-to-queue',
  'play-next',
  'toggle-like',
  'add-to-playlist',
])

const likedTracks = ref([])
const isLoading = ref(false)

const API_BASE_URL = 'https://discoveryprovider.audius.co/v1'
const APP_NAME = 'wavebeat-demo'

const fetchLikedTracks = async () => {
  if (!props.likedTrackIds || props.likedTrackIds.length === 0) {
    likedTracks.value = []
    return
  }

  isLoading.value = true
  try {
    const idParams = props.likedTrackIds.map((id) => `id=${id}`).join('&')
    const response = await fetch(`${API_BASE_URL}/tracks?${idParams}&app_name=${APP_NAME}`)
    const result = await response.json()
    // Ensure the order is preserved from the likedTrackIds array
    likedTracks.value = props.likedTrackIds
      .map((id) => result.data.find((t) => t.id === id))
      .filter(Boolean)
  } catch (error) {
    console.error('Failed to fetch liked tracks:', error)
  } finally {
    isLoading.value = false
  }
}

watch(() => props.likedTrackIds, fetchLikedTracks, { immediate: true })

const playFromList = ({ track }) => {
  emit('play-from-list', { sourceList: likedTracks.value, track })
}
</script>

<style scoped>
.liked-songs-view h1 {
  margin-bottom: 2rem;
}
.loading {
  text-align: center;
  font-size: 1.5rem;
  color: var(--text-secondary);
  padding: 4rem;
}
</style>
