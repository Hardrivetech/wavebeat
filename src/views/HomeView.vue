<template>
  <div>
    <!-- ... existing template ... -->

    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else>
      <!-- Show search results if they exist -->
      <TrackList
        v-if="tracks.length > 0"
        :tracks="tracks"
        title="Search Results"
        :has-searched="hasSearched"
        :liked-track-ids="likedTrackIds"
        @play-track="playFromList(tracks, $event)"
        @add-to-queue="emit('add-to-queue', $event)"
        @play-next="emit('play-next', $event)"
        @toggle-like="emit('toggle-like', $event)"
        @add-to-playlist="emit('add-to-playlist', $event)"
      />
      <!-- Otherwise, show discovery content -->
      <div v-else>
        <TrackList
          v-if="recentlyPlayedTracks.length > 0"
          :tracks="recentlyPlayedTracks"
          title="🎧 Recently Played"
          :liked-track-ids="likedTrackIds"
          @play-track="playFromList(recentlyPlayedTracks, $event)"
          @add-to-queue="emit('add-to-queue', $event)"
          @play-next="emit('play-next', $event)"
          @toggle-like="emit('toggle-like', $event)"
          @add-to-playlist="emit('add-to-playlist', $event)"
        />
        <PlaylistList v-if="userPlaylists.length > 0" :playlists="userPlaylists" />
        <TrackList
          v-if="likedTracks.length > 0"
          :tracks="likedTracks"
          title="💚 Liked Songs"
          :liked-track-ids="likedTrackIds"
          @play-track="playFromList(likedTracks, $event)"
          @add-to-queue="emit('add-to-queue', $event)"
          @play-next="emit('play-next', $event)"
          @toggle-like="emit('toggle-like', $event)"
          @add-to-playlist="emit('add-to-playlist', $event)"
        />
        <TrackList
          :tracks="trendingTracks"
          title="🔥 Trending on Audius"
          :liked-track-ids="likedTrackIds"
          @play-track="playFromList(trendingTracks, $event)"
          @add-to-queue="emit('add-to-queue', $event)"
          @play-next="emit('play-next', $event)"
          @toggle-like="emit('toggle-like', $event)"
          @add-to-playlist="emit('add-to-playlist', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import TrackList from '../components/TrackList.vue'
import PlaylistList from '../components/PlaylistList.vue'

const props = defineProps({
  likedTrackIds: {
    type: Array,
    default: () => [],
  },
  playQueue: {
    type: Array,
    default: () => [],
  },
  userPlaylists: {
    type: Array,
    default: () => [],
  },
  recentlyPlayedTracks: {
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

// You should get your own App Name from Audius for a real app, but 'wavebeat-demo' is fine for now.
const APP_NAME = 'wavebeat-demo'
const API_BASE_URL = 'https://discoveryprovider.audius.co/v1'

const tracks = ref([])
const trendingTracks = ref([])
const isLoading = ref(false)
const hasSearched = ref(false)

const likedTracks = computed(() => {
  // Create a pool of all unique tracks from different sources
  const allTracks = [...trendingTracks.value, ...tracks.value, ...props.playQueue]
  const uniqueTracks = [...new Map(allTracks.map((item) => [item['id'], item])).values()]
  // Filter this pool to get the full track objects for our liked IDs
  return uniqueTracks.filter((track) => props.likedTrackIds.includes(track.id))
})

// --- API & DATA FETCHING ---

onMounted(() => {
  fetchTrendingTracks()
})

const fetchTrendingTracks = async () => {
  isLoading.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/tracks/trending?app_name=${APP_NAME}`)
    if (!response.ok) throw new Error('Failed to fetch trending tracks')
    const result = await response.json()
    trendingTracks.value = result.data || []
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const playFromList = (sourceList, { track }) => {
  emit('play-from-list', { sourceList, track })
}
</script>

<style scoped>
.loading {
  text-align: center;
  font-size: 1.2rem;
  color: var(--text-secondary);
  padding: 3rem;
}
</style>
