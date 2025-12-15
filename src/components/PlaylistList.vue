<template>
  <div class="playlist-list-container">
    <h2>My Playlists</h2>
    <div v-if="playlists.length > 0" class="playlist-grid">
      <div
        v-for="playlist in playlists"
        :key="playlist.id"
        class="playlist-card"
        @click="goToPlaylist(playlist.id)"
      >
        <div class="playlist-artwork">
          <span class="icon">🎵</span>
        </div>
        <div class="playlist-name">{{ playlist.name }}</div>
        <div class="playlist-track-count">{{ playlist.trackIds.length }} tracks</div>
      </div>
    </div>
    <div v-else class="no-playlists">You haven't created any playlists yet.</div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  playlists: {
    type: Array,
    required: true,
  },
})

const router = useRouter()

const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`)
}
</script>

<style scoped>
.playlist-list-container {
  margin-bottom: 2rem;
}
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}
.playlist-card {
  background-color: var(--bg-elevation);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}
.playlist-card:hover {
  background-color: #3a3a3a;
}
.playlist-artwork {
  width: 100%;
  padding-bottom: 100%; /* 1:1 Aspect Ratio */
  position: relative;
  background-color: #333;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: grid;
  place-items: center;
  font-size: 4rem;
  color: #777;
}
.playlist-name {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.playlist-track-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.no-playlists {
  color: var(--text-secondary);
}
</style>
