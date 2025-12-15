<template>
  <PlaylistList :playlists="userPlaylists" @play-playlist="$emit('play-playlist', $event)" />
</template>

<script setup>
import PlaylistList from '../components/PlaylistList.vue'

defineProps({
  userPlaylists: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['play-playlist'])
</script>
