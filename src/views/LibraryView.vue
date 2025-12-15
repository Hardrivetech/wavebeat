<template>
  <div class="library-view">
    <h1>My Library</h1>
    <nav class="library-nav">
      <router-link to="/collection/playlists">Playlists</router-link>
      <router-link to="/collection/songs">Liked Songs</router-link>
    </nav>
    <router-view
      :user="user"
      :liked-track-ids="likedTrackIds"
      :user-playlists="userPlaylists"
      @play-from-list="$emit('play-from-list', $event)"
      @add-to-queue="$emit('add-to-queue', $event)"
      @play-next="$emit('play-next', $event)"
      @toggle-like="$emit('toggle-like', $event)"
      @add-to-playlist="$emit('add-to-playlist', $event)"
      @play-playlist="$emit('play-playlist', $event)"
    ></router-view>
  </div>
</template>

<script setup>
defineProps({
  user: Object,
  likedTrackIds: Array,
  userPlaylists: Array,
})

defineEmits([
  'play-from-list',
  'add-to-queue',
  'play-next',
  'toggle-like',
  'add-to-playlist',
  'play-playlist',
])
</script>

<style scoped>
.library-nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--bg-elevation);
}

.library-nav a {
  padding: 1rem 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: bold;
  border-bottom: 2px solid transparent;
}

.library-nav a.router-link-exact-active {
  color: var(--text-primary);
  border-bottom-color: var(--brand-green);
}
</style>
