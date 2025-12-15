<template>
  <div>
    <h2 v-if="tracks.length > 0">{{ title }}</h2>
    <TrackListSkeleton v-if="isLoading" :count="5" :show-title="false" />
    <HorizontalTrackList
      v-if="!isLoading && tracks.length > 0"
      :tracks="tracks"
      @play-track="playFromList($event)"
      @add-to-queue="$emit('add-to-queue', $event)"
      @play-next="$emit('play-next', $event)"
      @toggle-like="$emit('toggle-like', $event)"
      @add-to-playlist="$emit('add-to-playlist', $event)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import HorizontalTrackList from './HorizontalTrackList.vue'
import TrackListSkeleton from './TrackListSkeleton.vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
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

const tracks = ref([])
const isLoading = ref(false)

const APP_NAME = 'wavebeat-demo'
const API_BASE_URL = 'https://discoveryprovider.audius.co/v1'

const fetchGenreTracks = async () => {
  isLoading.value = true
  try {
    const response = await fetch(
      `${API_BASE_URL}/tracks/trending?genre=${props.genre}&app_name=${APP_NAME}`,
    )
    if (!response.ok) throw new Error(`Failed to fetch trending tracks for ${props.genre}`)
    const result = await response.json()
    tracks.value = result.data || []
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchGenreTracks)

const playFromList = (track) => {
  emit('play-from-list', { sourceList: tracks.value, track })
}
</script>
