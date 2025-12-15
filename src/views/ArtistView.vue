<template>
  <div v-if="isLoading">
    <ArtistHeaderSkeleton />
    <TrackListSkeleton :count="5" />
  </div>
  <div v-else-if="artist" class="artist-view">
    <div class="artist-header">
      <img :src="artist.image[3]['#text']" class="artist-avatar" />
      <div class="artist-info">
        <h1>{{ artist.name }}</h1>
        <p v-if="artist.bio.summary" v-html="artist.bio.summary" class="bio"></p>
        <div class="artist-stats">
          <span>{{ formatNumber(artist.stats.listeners) }} listeners</span>
        </div>
      </div>
    </div>

    <TrackList
      title="Top Tracks"
      :tracks="topTracks"
      :liked-track-ids="likedTrackIds"
      @play-track="playFromList($event)"
      @add-to-queue="emit('add-to-queue', $event)"
      @play-next="emit('play-next', $event)"
      @toggle-like="emit('toggle-like', $event)"
      @add-to-playlist="emit('add-to-playlist', $event)"
    />
    <div class="pagination-controls">
      <button v-if="canLoadMore" @click="loadMoreTracks" :disabled="isFetchingMore">
        {{ isFetchingMore ? 'Loading...' : 'Load More' }}
      </button>
    </div>
  </div>
  <div v-else class="not-found">Artist not found.</div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getArtistInfo } from '../services/lastfmService'
import TrackList from '../components/TrackList.vue'
import ArtistHeaderSkeleton from '../components/ArtistHeaderSkeleton.vue'
import TrackListSkeleton from '../components/TrackListSkeleton.vue'

defineProps({
  likedTrackIds: Array,
  user: Object,
})

const emit = defineEmits([
  'play-from-list',
  'add-to-queue',
  'play-next',
  'toggle-like',
  'add-to-playlist',
])

const route = useRoute()
const artist = ref(null)
const topTracks = ref([])
const isLoading = ref(true)
const isFetchingMore = ref(false)
const canLoadMore = ref(false)
const currentPage = ref(0)
const audiusUserId = ref(null)
const PAGE_SIZE = 20

const AUDIUS_API_BASE_URL = 'https://discoveryprovider.audius.co/v1'
const APP_NAME = 'wavebeat-demo'

const fetchArtistData = async (handle, isLoadMore = false) => {
  const cleanHandle = handle?.replace(/^@/, '')
  if (!cleanHandle) return

  if (isLoadMore) {
    isFetchingMore.value = true
  } else {
    isLoading.value = true
    artist.value = null
    topTracks.value = []
    currentPage.value = 0
    audiusUserId.value = null
  }

  try {
    let audiusUser = null

    // On initial load, fetch all metadata
    if (!isLoadMore) {
      // 1. Fetch metadata from Last.fm
      const lastfmData = await getArtistInfo(cleanHandle)
      if (!lastfmData) {
        throw new Error('Artist not found on Last.fm')
      }
      artist.value = lastfmData

      // 2. Fetch Audius user to get their ID
      const userSearchResponse = await fetch(
        `${AUDIUS_API_BASE_URL}/users/search?query=${encodeURIComponent(cleanHandle)}&app_name=${APP_NAME}`,
      )
      const userSearchResult = await userSearchResponse.json()
      audiusUser = userSearchResult.data?.[0]
      if (!audiusUser) {
        throw new Error('Audius user not found')
      }
      audiusUserId.value = audiusUser.id
    }

    // 3. Fetch a page of top tracks from Audius
    const offset = currentPage.value * PAGE_SIZE
    const tracksResponse = await fetch(
      `${AUDIUS_API_BASE_URL}/users/${audiusUserId.value}/tracks?sort=plays&app_name=${APP_NAME}&limit=${PAGE_SIZE}&offset=${offset}`,
    )
    if (tracksResponse.ok) {
      const tracksResult = await tracksResponse.json()
      const newTracks = tracksResult.data || []
      topTracks.value.push(...newTracks)
      // If we received a full page of tracks, it's possible there are more
      canLoadMore.value = newTracks.length === PAGE_SIZE
    }
  } catch (error) {
    console.error('Failed to fetch artist data:', error)
    if (!isLoadMore) artist.value = null
  } finally {
    isLoading.value = false
    isFetchingMore.value = false
  }
}

onMounted(() => {
  fetchArtistData(route.params.handle)
})

watch(() => route.params.handle, fetchArtistData)

const loadMoreTracks = () => {
  currentPage.value++
  fetchArtistData(route.params.handle, true)
}

const playFromList = ({ track }) => {
  emit('play-from-list', { sourceList: topTracks.value, track })
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(
    num,
  )
}
</script>

<style scoped>
.artist-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
}
.artist-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}
.artist-info h1 {
  margin-bottom: 0.5rem;
}
.bio {
  color: var(--text-secondary);
  max-width: 60ch;
}
.artist-stats {
  margin-top: 1rem;
  color: var(--text-secondary);
  font-weight: bold;
}
.loading,
.pagination-controls {
  text-align: center;
  margin-top: 2rem;
}
.pagination-controls button {
  background-color: var(--bg-elevation);
  color: var(--text-primary);
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
}
.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.not-found {
  text-align: center;
  font-size: 1.5rem;
  color: var(--text-secondary);
  padding: 4rem;
}
</style>
