<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h3>Manage Collaborators</h3>
      <p class="playlist-name">{{ playlist.name }}</p>

      <div class="collaborator-list">
        <div v-for="userId in playlist.collaborators" :key="userId" class="collaborator-item">
          <span>{{ collaboratorNames[userId] || 'Loading...' }}</span>
          <button v-if="userId !== playlist.ownerId" @click="remove(userId)" class="remove-btn">
            Remove
          </button>
          <span v-else class="owner-tag">Owner</span>
        </div>
      </div>

      <form @submit.prevent="addByEmail" class="add-form">
        <input type="email" v-model="newUserEmail" placeholder="Add by email" required />
        <button type="submit">Add</button>
      </form>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getUserProfile,
  findUserByEmail,
  addCollaborator,
  removeCollaborator,
} from '../services/authService'

const props = defineProps({
  playlist: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'collaborator-changed'])

const collaboratorNames = ref({})
const newUserEmail = ref('')
const error = ref('')

const fetchCollaboratorNames = async () => {
  const names = {}
  for (const userId of props.playlist.collaborators) {
    const profile = await getUserProfile(userId)
    names[userId] = profile?.displayName || profile?.email || 'Unknown User'
  }
  collaboratorNames.value = names
}

onMounted(fetchCollaboratorNames)

const addByEmail = async () => {
  error.value = ''
  if (!newUserEmail.value.trim()) return

  try {
    const userToAdd = await findUserByEmail(newUserEmail.value.trim())
    if (!userToAdd) {
      error.value = 'User not found.'
      return
    }
    if (props.playlist.collaborators.includes(userToAdd.id)) {
      error.value = 'User is already a collaborator.'
      return
    }

    await addCollaborator(props.playlist.id, userToAdd.id)
    emit('collaborator-changed')
    newUserEmail.value = ''
    fetchCollaboratorNames() // Refresh names
  } catch (e) {
    error.value = 'Failed to add collaborator.'
    console.error(e)
  }
}

const remove = async (userId) => {
  try {
    await removeCollaborator(props.playlist.id, userId)
    emit('collaborator-changed')
    fetchCollaboratorNames() // Refresh names
  } catch (e) {
    console.error('Failed to remove collaborator:', e)
  }
}
</script>

<style scoped>
.modal-overlay {
  /* Styles from AddToPlaylistModal */
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
  /* Styles from AddToPlaylistModal */
  background-color: var(--bg-elevation);
  padding: 1.5rem;
  border-radius: 8px;
  width: 350px;
}
.playlist-name {
  font-weight: bold;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}
.collaborator-list {
  margin: 1rem 0;
}
.collaborator-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}
.owner-tag {
  font-size: 0.8rem;
  color: var(--text-secondary);
}
.add-form {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
.error-message {
  color: #e53e3e;
  margin-top: 1rem;
  font-size: 0.9rem;
}
</style>
