<template>
  <div class="profile-view">
    <div v-if="user" class="profile-header">
      <div v-if="!isEditing">
        <h1>{{ user.displayName }}</h1>
        <button @click="isEditing = true" class="edit-button">Edit Profile</button>
      </div>
      <div v-else class="edit-form">
        <input type="text" v-model="editableDisplayName" />
        <button @click="saveProfile" class="save-button">Save</button>
        <button @click="cancelEdit" class="cancel-button">Cancel</button>
      </div>
    </div>

    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <PlaylistList
        v-if="userPlaylists.length > 0"
        :playlists="userPlaylists"
        @play-playlist="emit('play-playlist', $event)"
      />

      <TrackList
        v-if="likedTracks.length > 0"
        :tracks="likedTracks"
        title="💚 Liked Songs"
        :liked-track-ids="likedTrackIds"
        @play-track="playFromList(likedTracks, $event)"
        @add-to-queue="emit('add-to-queue', $event)"
        @play-next="emit('play-next', $event)"
        @toggle-like="emit('toggle-like', $event)"
        @add-to-playlist="emit('add-to-playlist', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { updateUserProfile } from '../services/authService'
import TrackList from '../components/TrackList.vue'
import PlaylistList from '../components/PlaylistList.vue'

const props = defineProps({
  user: Object,
  likedTrackIds: Array,
  userPlaylists: Array,
})

const emit = defineEmits([
  'play-from-list',
  'add-to-queue',
  'play-next',
  'toggle-like',
  'add-to-playlist',
  'play-playlist',
  'profile-updated',
])

const likedTracks = ref([])
const isLoading = ref(true)
const isEditing = ref(false)
const editableDisplayName = ref('')

const API_BASE_URL = 'https://discoveryprovider.audius.co/v1'
const APP_NAME = 'wavebeat-demo'

const fetchLikedTracks = async () => {
  if (!props.likedTrackIds || props.likedTrackIds.length === 0) {
    likedTracks.value = []
    isLoading.value = false
    return
  }

  isLoading.value = true
  try {
    const idParams = props.likedTrackIds.map((id) => `id=${id}`).join('&')
    const response = await fetch(`${API_BASE_URL}/tracks?${idParams}&app_name=${APP_NAME}`)
    const result = await response.json()
    likedTracks.value = props.likedTrackIds
      .map((id) => result.data.find((t) => t.id === id))
      .filter(Boolean)
  } catch (error) {
    console.error('Failed to fetch liked tracks:', error)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      editableDisplayName.value = newUser.displayName
      fetchLikedTracks()
    }
  },
  { immediate: true },
)

const saveProfile = async () => {
  if (!props.user || !editableDisplayName.value.trim()) return
  try {
    await updateUserProfile(props.user.uid, {
      displayName: editableDisplayName.value.trim(),
    })
    emit('profile-updated', { displayName: editableDisplayName.value.trim() })
    isEditing.value = false
  } catch (error) {
    console.error('Failed to update profile:', error)
  }
}

const cancelEdit = () => {
  editableDisplayName.value = props.user.displayName
  isEditing.value = false
}

const playFromList = (sourceList, { track }) => {
  emit('play-from-list', { sourceList, track })
}
</script>

<style scoped>
.profile-header {
  margin-bottom: 2rem;
}

.profile-header h1 {
  display: inline-block;
  margin-right: 1rem;
}

.edit-button,
.cancel-button {
  background: none;
  border: 1px solid var(--text-secondary);
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  cursor: pointer;
}

.save-button {
  background-color: var(--brand-green);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  cursor: pointer;
  margin-left: 1rem;
}

.edit-form {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.edit-form input {
  font-size: 2.5rem;
  font-weight: 900;
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--brand-green);
  color: var(--text-primary);
  outline: none;
}
</style>
