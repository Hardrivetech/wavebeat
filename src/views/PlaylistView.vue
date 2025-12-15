<template>
  <div v-if="isLoading"><TrackListSkeleton :count="8" /></div>
  <div v-else-if="playlist" class="playlist-view">
    <div class="playlist-header">
      <div class="playlist-artwork" @click="triggerArtworkUpload">
        <img v-if="playlist.artworkUrl" :src="playlist.artworkUrl" class="artwork-image" />
        <span v-else>🎵</span>
        <div class="artwork-overlay">
          <span v-if="isOwner">Change Artwork</span>
        </div>
      </div>
      <div class="playlist-info">
        <h1 v-if="!isEditingName" @click="startEditingName" class="playlist-name editable">
          {{ playlist.name }}
        </h1>
        <input
          v-else
          ref="editNameInput"
          v-model="editableName"
          class="playlist-name-input"
          @blur="cancelEditName"
          @keydown.enter="saveName"
          @keydown.esc="cancelEditName"
        />
        <p class="playlist-details">
          Created by {{ ownerName }} &middot; {{ tracks.length }} songs
        </p>
        <button @click="playPlaylist" class="play-button">Play</button>
        <button v-if="isOwner" @click="isCollaboratorModalVisible = true" class="manage-button">
          Manage
        </button>
        <button v-if="isCollaborator" @click="handleDeletePlaylist" class="delete-button">
          Delete
        </button>
      </div>
    </div>
    <TrackList
      :tracks="tracks"
      :liked-track-ids="likedTrackIds"
      :is-playlist-context="true"
      @play-track="playFromPlaylist"
      @add-to-queue="emit('add-to-queue', $event)"
      @play-next="emit('play-next', $event)"
      @toggle-like="emit('toggle-like', $event)"
      @add-to-playlist="emit('add-to-playlist', $event)"
      @remove-from-playlist="handleRemoveTrack"
      @reorder="handleReorder"
    />
  </div>
  <CollaboratorsModal
    v-if="isCollaboratorModalVisible"
    :playlist="playlist"
    @close="isCollaboratorModalVisible = false"
    @collaborator-changed="fetchPlaylistData(playlist.id)"
  />
  <div v-else class="not-found">Playlist not found.</div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getPlaylist,
  getUserProfile,
  removeTrackFromPlaylist,
  deletePlaylist,
  updatePlaylistTrackOrder,
  updatePlaylist,
} from '../services/authService'
import TrackList from '../components/TrackList.vue'
import CollaboratorsModal from '../components/CollaboratorsModal.vue'
import TrackListSkeleton from '../components/TrackListSkeleton.vue'

const props = defineProps({
  likedTrackIds: Array,
  user: Object,
  playQueue: Array,
  recentlyPlayedTracks: Array,
  userPlaylists: Array,
})

const emit = defineEmits([
  'play-from-list',
  'add-to-queue',
  'play-next',
  'toggle-like',
  'add-to-playlist',
  'reorder',
  'playlist-deleted',
  'profile-updated',
])

const route = useRoute()
const router = useRouter()
const playlist = ref(null)
const tracks = ref([])
const ownerName = ref('')
const isLoading = ref(true)
const isCollaboratorModalVisible = ref(false)
const isEditingName = ref(false)
const editableName = ref('')
const editNameInput = ref(null)

const isOwner = computed(
  () => props.user && playlist.value && props.user.uid === playlist.value.ownerId,
)
const isCollaborator = computed(
  () => props.user && playlist.value && playlist.value.collaborators.includes(props.user.uid),
)
const API_BASE_URL = 'https://discoveryprovider.audius.co/v1'
const APP_NAME = 'wavebeat-demo'

const fetchPlaylistData = async (playlistId) => {
  isLoading.value = true
  try {
    const playlistData = await getPlaylist(playlistId)
    playlist.value = playlistData

    if (playlistData) {
      // Fetch owner's name
      const ownerProfile = await getUserProfile(playlistData.ownerId)
      ownerName.value = ownerProfile?.displayName || 'a user'

      // Fetch track details from Audius API
      if (playlistData.trackIds && playlistData.trackIds.length > 0) {
        const idParams = playlistData.trackIds.map((id) => `id=${id}`).join('&')
        const response = await fetch(`${API_BASE_URL}/tracks?${idParams}&app_name=${APP_NAME}`)
        const result = await response.json()
        // Ensure track order is the same as in the playlist
        tracks.value = playlistData.trackIds
          .map((id) => result.data.find((t) => t.id === id))
          .filter(Boolean)
      } else {
        tracks.value = []
      }
    }
  } catch (error) {
    console.error('Failed to fetch playlist data:', error)
    playlist.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchPlaylistData(route.params.id)
})

// Refetch if the route changes (e.g., navigating from one playlist to another)
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchPlaylistData(newId)
    }
  },
)

const playPlaylist = () => {
  if (tracks.value.length > 0) {
    playFromPlaylist({ track: tracks.value[0], index: 0 })
  }
}

const playFromPlaylist = ({ track }) => {
  emit('play-from-list', { sourceList: tracks.value, track })
}

const handleReorder = async (newOrder) => {
  if (!playlist.value) return
  // Optimistically update the UI
  tracks.value = newOrder
  const newTrackIds = newOrder.map((track) => track.id)
  try {
    await updatePlaylistTrackOrder(playlist.value.id, newTrackIds)
  } catch (error) {
    console.error('Failed to save new track order:', error)
    // Optionally, revert the order here if the save fails
  }
}

const handleRemoveTrack = async (trackToRemove) => {
  if (!playlist.value) return
  try {
    await removeTrackFromPlaylist(playlist.value.id, trackToRemove.id)
    // Optimistically update the UI
    tracks.value = tracks.value.filter((t) => t.id !== trackToRemove.id)
  } catch (error) {
    console.error('Failed to remove track:', error)
  }
}

const triggerArtworkUpload = async () => {
  if (!isOwner.value) return

  const newUrl = window.prompt(
    'Enter a URL for the new playlist artwork:',
    playlist.value.artworkUrl || '',
  )

  // Check if the user provided a URL and it's a valid-looking URL
  if (newUrl && newUrl.trim() && newUrl.startsWith('http')) {
    try {
      await updatePlaylist(playlist.value.id, { artworkUrl: newUrl })
      playlist.value.artworkUrl = newUrl
    } catch (error) {
      console.error('Failed to update artwork URL:', error)
    }
  }
}

const startEditingName = () => {
  if (!isOwner.value) return
  editableName.value = playlist.value.name
  isEditingName.value = true
  nextTick(() => {
    editNameInput.value?.focus()
  })
}

const saveName = async () => {
  if (!isEditingName.value || !playlist.value) return
  const newName = editableName.value.trim()
  if (newName && newName !== playlist.value.name) {
    await updatePlaylist(playlist.value.id, { name: newName })
    playlist.value.name = newName
  }
  isEditingName.value = false
}

const cancelEditName = () => {
  isEditingName.value = false
  editableName.value = ''
}

const handleDeletePlaylist = async () => {
  if (!playlist.value) return
  if (window.confirm(`Are you sure you want to delete "${playlist.value.name}"?`)) {
    try {
      await deletePlaylist(playlist.value.id)
      emit('playlist-deleted', playlist.value.id)
      router.push('/')
    } catch (error) {
      console.error('Error deleting playlist:', error)
    }
  }
}
</script>

<style scoped>
.playlist-header {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.playlist-artwork {
  width: 200px;
  height: 200px;
  background-color: #333;
  display: grid;
  place-items: center;
  font-size: 6rem;
  color: #777;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}
.artwork-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.artwork-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.playlist-artwork:hover .artwork-overlay {
  opacity: 1;
}
.playlist-name.editable:hover {
  text-decoration: underline;
  cursor: pointer;
}
.playlist-name-input {
  font-size: 2.5rem;
  font-weight: 900;
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--brand-green);
  color: var(--text-primary);
  outline: none;
  padding: 0;
  margin: 0;
  width: 100%;
}
.play-button {
  background-color: var(--brand-green);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.8rem 2rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
}
.manage-button {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--text-secondary);
  border-radius: 50px;
  padding: 0.8rem 2rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  margin-left: 1rem;
}
.delete-button {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--text-secondary);
  border-radius: 50px;
  padding: 0.8rem 2rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  margin-left: 1rem;
}
.loading,
.not-found {
  text-align: center;
  font-size: 1.5rem;
  color: var(--text-secondary);
  padding: 4rem;
}
</style>
