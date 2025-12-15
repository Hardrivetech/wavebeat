<template>
  <div class="search-view">
    <h1 v-if="query">Search Results for "{{ query }}"</h1>
    <TrackListSkeleton v-if="isLoading" :count="10" :show-title="false" />
    <TrackList
      v-else
      :tracks="searchResults"
      :liked-track-ids="likedTrackIds"
      :has-searched="true"
      @play-track="playFromList($event)"
      @add-to-queue="emit('add-to-queue', $event)"
      @play-next="emit('play-next', $event)"
      @toggle-like="emit('toggle-like', $event)"
      @add-to-playlist="emit('add-to-playlist', $event)"
    />
    <div class="pagination-controls">
      <button v-if="canLoadMore" @click="loadMore" :disabled="isFetchingMore">
        {{ isFetchingMore ? 'Loading...' : 'Load More' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import TrackList from '../components/TrackList.vue'
import TrackListSkeleton from '../components/TrackListSkeleton.vue'

defineProps({
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
const searchResults = ref([])
const isLoading = ref(false)
const query = ref(route.query.q || '')
const isFetchingMore = ref(false)
const canLoadMore = ref(false)
const currentPage = ref(1) // Audius search pagination is 1-based

const API_BASE_URL = 'https://discoveryprovider.audius.co/v1'
const APP_NAME = 'wavebeat-demo'

const performSearch = async (searchQuery, isLoadMore = false) => {
  if (!searchQuery) {
    searchResults.value = []
    return
  }

  if (isLoadMore) {
    isFetchingMore.value = true
  } else {
    isLoading.value = true
    searchResults.value = []
    currentPage.value = 1
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/tracks/search?query=${encodeURIComponent(searchQuery)}&page=${currentPage.value}&app_name=${APP_NAME}`,
    )
    const result = await response.json()
    const newTracks = result.data || []
    searchResults.value.push(...newTracks)
    // The search endpoint doesn't tell us if there are more pages, so we assume there might be if we got results.
    canLoadMore.value = newTracks.length > 0
  } catch (error) {
    console.error('Failed to perform search:', error)
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

const loadMore = () => {
  currentPage.value++
  performSearch(query.value, true)
}

watch(
  () => route.query.q,
  (newQuery) => {
    query.value = newQuery
    performSearch(newQuery)
  },
  { immediate: true },
)

const playFromList = ({ track }) => {
  emit('play-from-list', { sourceList: searchResults.value, track })
}
</script>

<style scoped>
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
.loading {
  text-align: center;
  font-size: 1.5rem;
  color: var(--text-secondary);
  padding: 4rem;
}
</style>
