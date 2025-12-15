<template>
  <div>
    <GenreSection
      v-for="genre in genres"
      :key="genre.id"
      :title="genre.title"
      :genre="genre.id"
      :liked-track-ids="likedTrackIds"
      @play-from-list="emit('play-from-list', $event)"
      @add-to-queue="emit('add-to-queue', $event)"
      @play-next="emit('play-next', $event)"
      @toggle-like="emit('toggle-like', $event)"
      @add-to-playlist="emit('add-to-playlist', $event)"
    />
  </div>
</template>

<script setup>
import GenreSection from '../components/GenreSection.vue'

defineProps({
  user: Object,
  likedTrackIds: {
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

const genres = [
  { id: 'Electronic', title: '⚡ Electronic' },
  { id: 'Hip-Hop/Rap', title: '🎤 Hip-Hop/Rap' },
  { id: 'Pop', title: '✨ Pop' },
  { id: 'Rock', title: '🎸 Rock' },
  { id: 'Chill', title: '🧘‍♀️ Chill' },
]
</script>
