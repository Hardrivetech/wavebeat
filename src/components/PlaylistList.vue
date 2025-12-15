<template>
  <div class="playlist-list-container">
    <h2>Playlists</h2>
    <div v-if="playlists.length > 0" class="playlist-grid">
      <div
        v-for="playlist in playlists"
        :key="playlist.id"
        class="playlist-card"
        @click="goToPlaylist(playlist.id)"
      >
        <div class="playlist-artwork">
          <img v-if="playlist.artworkUrl" :src="playlist.artworkUrl" class="artwork-image" />
          <span v-else class="icon">🎵</span>
          <button
            class="play-button"
            @click.stop="$emit('play-playlist', playlist)"
            aria-label="Play Playlist"
          >
            ▶
          </button>
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

defineEmits(['play-playlist'])

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
  background-color: #181818;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}
.playlist-card .play-button {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  background-color: var(--brand-green);
  color: black;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.2s ease-out;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
.playlist-card:hover {
  background-color: var(--bg-elevation);
}
.playlist-card:hover .play-button {
  opacity: 1;
  transform: translateY(0);
}
.playlist-artwork {
  width: 100%;
  padding-bottom: 100%; /* 1:1 Aspect Ratio */
  position: relative;
  background-color: #333;
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow: hidden; /* Ensures image corners are rounded */
}
.playlist-artwork .icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  color: #777;
}
.artwork-image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
