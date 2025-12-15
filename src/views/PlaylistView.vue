<template>
  <div v-if="isLoading" class="loading">Loading playlist...</div>
  <div v-else-if="playlist" class="playlist-view">
    <div class="playlist-header">
      <div class="playlist-artwork">🎵</div>
      <div class="playlist-info">
        <h1 class="playlist-name">{{ playlist.name }}</h1>
        <p class="playlist-details">
          Created by {{ ownerName }} &middot; {{ tracks.length }} songs
        </p>
        <button @click="playPlaylist" class="play-button">Play</button>
      </div>
    </div>
    <TrackList
      :tracks="tracks"
      :liked-track-ids="likedTrackIds"
      :is-playlist-context="true"
      @play-track="playFromPlaylist"
      @add-to-queue="emit('add-to-queue', $event)"
      @play-next="emit('play-next', $event)"
      @toggle-like="emit('toggle-like', $event)"
      @add-to-playlist="emit('add-to-playlist', $event)"
      @remove-from-playlist="handleRemoveTrack"
    />
  </div>
  <div v-else class="not-found">Playlist not found.</div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPlaylist, getUserProfile, removeTrackFromPlaylist } from '../services/authService'
import TrackList from '../components/TrackList.vue'

const props = defineProps({
  likedTrackIds: Array,
})

const emit = defineEmits([
  'play-from-list',
  'add-to-queue',
  'play-next',
  'toggle-like',
  'add-to-playlist',
])

const route = useRoute()
const playlist = ref(null)
const tracks = ref([])
const ownerName = ref('')
const isLoading = ref(true)

const API_BASE_URL = 'https://discoveryprovider.audius.co/v1'
const APP_NAME = 'wavebeat-demo'

const fetchPlaylistData = async (playlistId) => {
  isLoading.value = true
  try {
    const playlistData = await getPlaylist(playlistId)
    playlist.value = playlistData

    if (playlistData) {
      // Fetch owner's name
      const ownerProfile = await getUserProfile(playlistData.ownerId)
      ownerName.value = ownerProfile?.displayName || 'a user'

      // Fetch track details from Audius API
      if (playlistData.trackIds && playlistData.trackIds.length > 0) {
        const idParams = playlistData.trackIds.map((id) => `id=${id}`).join('&')
        const response = await fetch(`${API_BASE_URL}/tracks?${idParams}&app_name=${APP_NAME}`)
        const result = await response.json()
        // Ensure track order is the same as in the playlist
        tracks.value = playlistData.trackIds
          .map((id) => result.data.find((t) => t.id === id))
          .filter(Boolean)
      } else {
        tracks.value = []
      }
    }
  } catch (error) {
    console.error('Failed to fetch playlist data:', error)
    playlist.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchPlaylistData(route.params.id)
})

// Refetch if the route changes (e.g., navigating from one playlist to another)
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchPlaylistData(newId)
    }
  },
)

const playPlaylist = () => {
  if (tracks.value.length > 0) {
    playFromPlaylist({ track: tracks.value[0], index: 0 })
  }
}

const playFromPlaylist = ({ track, index }) => {
  emit('play-from-list', { sourceList: tracks.value, track })
}

const handleRemoveTrack = async (trackToRemove) => {
  if (!playlist.value) return
  try {
    await removeTrackFromPlaylist(playlist.value.id, trackToRemove.id)
    // Optimistically update the UI
    tracks.value = tracks.value.filter((t) => t.id !== trackToRemove.id)
  } catch (error) {
    console.error('Failed to remove track:', error)
  }
}
</script>

<style scoped>
.playlist-header {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.playlist-artwork {
  width: 200px;
  height: 200px;
  background-color: #333;
  display: grid;
  place-items: center;
  font-size: 6rem;
  color: #777;
  border-radius: 8px;
}
.play-button {
  background-color: var(--brand-green);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.8rem 2rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
}
.loading,
.not-found {
  text-align: center;
  font-size: 1.5rem;
  color: var(--text-secondary);
  padding: 4rem;
}
</style>
