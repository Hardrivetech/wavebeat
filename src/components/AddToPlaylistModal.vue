<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h3>Add to playlist</h3>
      <div class="playlist-list">
        <div class="playlist-item new-playlist" @click="showCreateForm = true">
          <div class="new-playlist-icon">+</div>
          <span>New playlist</span>
        </div>
        <div
          v-for="playlist in playlists"
          :key="playlist.id"
          class="playlist-item"
          @click="addToPlaylist(playlist.id)"
        >
          {{ playlist.name }}
        </div>
      </div>
      <form v-if="showCreateForm" @submit.prevent="createNewPlaylist" class="create-form">
        <input
          type="text"
          v-model="newPlaylistName"
          placeholder="Playlist name"
          required
          ref="newPlaylistInput"
        />
        <button type="submit">Create</button>
      </form>
      <p v-if="notification" class="notification">{{ notification }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { createPlaylist, addTrackToPlaylist } from '../services/authService'

const props = defineProps({
  playlists: Array,
  track: Object,
  user: Object,
})

const emit = defineEmits(['close', 'playlist-created', 'track-added'])

const showCreateForm = ref(false)
const newPlaylistName = ref('')
const newPlaylistInput = ref(null)
const notification = ref('')

watch(showCreateForm, (isShown) => {
  if (isShown) {
    nextTick(() => {
      newPlaylistInput.value?.focus()
    })
  }
})

const createNewPlaylist = async () => {
  if (!newPlaylistName.value.trim() || !props.user) return

  const newPlaylist = await createPlaylist(props.user.uid, newPlaylistName.value.trim())
  emit('playlist-created', newPlaylist)
  await addToPlaylist(newPlaylist.id)

  newPlaylistName.value = ''
  showCreateForm.value = false
}

const addToPlaylist = async (playlistId) => {
  if (!props.track) return
  await addTrackToPlaylist(playlistId, props.track.id)
  emit('track-added', { playlistId, trackId: props.track.id })
  showNotification(`Added to playlist.`)
  setTimeout(() => emit('close'), 1000)
}

const showNotification = (message) => {
  notification.value = message
  setTimeout(() => (notification.value = ''), 3000)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}
.modal-content {
  background-color: var(--bg-elevation);
  padding: 1.5rem;
  border-radius: 8px;
  width: 300px;
  text-align: center;
}
.playlist-list {
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
}
.playlist-item {
  padding: 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  text-align: left;
}
.playlist-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.new-playlist {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
}
.new-playlist-icon {
  width: 30px;
  height: 30px;
  background-color: #444;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
}
.create-form {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}
.notification {
  margin-top: 1rem;
  color: var(--brand-green);
}
</style>
