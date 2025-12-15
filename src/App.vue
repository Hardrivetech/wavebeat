<template>
  <header>
    <h1 @click="$router.push('/')" style="cursor: pointer">🎵 WaveBeat</h1>
    <SearchBar />
    <nav>
      <div v-if="user">
        <router-link to="/collection">My Library</router-link>
        <router-link :to="'/profile'">{{ user.displayName || user.email }}</router-link>
        <button @click="handleLogout">Logout</button>
      </div>
      <div v-else>
        <router-link to="/login">Login</router-link>
        <router-link to="/signup" class="signup-button">Sign Up</router-link>
      </div>
    </nav>
  </header>

  <main>
    <!-- The router will render the correct page component here -->
    <router-view
      :liked-track-ids="likedTrackIds"
      :play-queue="playQueue"
      :user="user"
      :user-playlists="userPlaylists"
      :recently-played-tracks="recentlyPlayedTracks"
      @play-from-list="playFromList"
      @add-to-queue="addToQueue"
      @play-next="playNextInQueue"
      @toggle-like="toggleLike"
      @add-to-playlist="openAddToPlaylistModal"
      @playlist-deleted="handlePlaylistDeleted"
      @play-playlist="handlePlayPlaylist"
      @profile-updated="handleProfileUpdated"
    >
    </router-view>
  </main>

  <AudioPlayer
    :track="currentTrack"
    :audio-src="audioSrc"
    :liked-track-ids="likedTrackIds"
    :is-shuffle-active="isShuffleActive"
    :repeat-mode="repeatMode"
    @track-ended="playNext"
    @play-next="playNext"
    @play-previous="playPrevious"
    @toggle-like="toggleLike"
    @toggle-shuffle="toggleShuffle"
    @cycle-repeat="cycleRepeat"
    @toggle-queue="toggleQueuePanel"
  />

  <QueuePanel
    :is-visible="isQueuePanelVisible"
    :queue="playQueue"
    :current-track="currentTrack"
    :current-queue-index="currentQueueIndex"
    @close="toggleQueuePanel"
    @play-from-queue="playFromQueueIndex"
  />

  <AddToPlaylistModal
    v-if="isPlaylistModalVisible"
    :user="user"
    :track="trackForPlaylist"
    :playlists="userPlaylists"
    @close="isPlaylistModalVisible = false"
    @playlist-created="handlePlaylistCreated"
    @track-added="handleTrackAddedToPlaylist"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AudioPlayer from './components/AudioPlayer.vue'
import SearchBar from './components/SearchBar.vue'
import QueuePanel from './components/QueuePanel.vue'
import AddToPlaylistModal from './components/AddToPlaylistModal.vue'
import {
  onAuthStateChanged,
  logout,
  getUserProfile,
  likeTrack,
  unlikeTrack,
  getUserPlaylists,
} from './services/authService'

// You should get your own App Name from Audius for a real app, but 'wavebeat-demo' is fine for now.
const APP_NAME = 'wavebeat-demo'
const API_BASE_URL = 'https://discoveryprovider.audius.co/v1'

const playQueue = ref([])
const currentQueueIndex = ref(-1)
const currentTrack = ref(null)
const audioSrc = ref('')
const likedTrackIds = ref([])
const isShuffleActive = ref(false)
const repeatMode = ref('off') // 'off', 'all', 'one'
const user = ref(null)
const isQueuePanelVisible = ref(false)
const isPlaylistModalVisible = ref(false)
const trackForPlaylist = ref(null)
const userPlaylists = ref([])
const recentlyPlayedTracks = ref([])
const router = useRouter()

// --- AUTHENTICATION ---

onMounted(() => {
  onAuthStateChanged(async (firebaseUser) => {
    // Load recently played from localStorage on startup
    const savedRecentlyPlayed = localStorage.getItem('wavebeat_recently_played')
    if (savedRecentlyPlayed) {
      recentlyPlayedTracks.value = JSON.parse(savedRecentlyPlayed)
    }

    if (firebaseUser) {
      // User is signed in, fetch their profile from Firestore.
      const userProfile = await getUserProfile(firebaseUser.uid)
      user.value = userProfile || firebaseUser // Fallback to auth user object if profile doesn't exist

      // Load liked songs from the user's Firestore profile
      if (userProfile && userProfile.liked_songs) {
        likedTrackIds.value = userProfile.liked_songs
      }

      // Load user's playlists
      userPlaylists.value = await getUserPlaylists(firebaseUser.uid)
    } else {
      user.value = null
      // Clear user-specific data
      likedTrackIds.value = []
      userPlaylists.value = []
    }
  })
})

const handleLogout = async () => {
  try {
    await logout()
    router.push('/login')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

const getTrackStream = async (track) => {
  if (!track) {
    audioSrc.value = ''
    currentTrack.value = null
    return
  }
  currentTrack.value = track

  // --- Add to Recently Played ---
  // Remove existing instance of the track to move it to the top
  const existingIndex = recentlyPlayedTracks.value.findIndex((t) => t.id === track.id)
  if (existingIndex > -1) {
    recentlyPlayedTracks.value.splice(existingIndex, 1)
  }
  // Add to the beginning of the list
  recentlyPlayedTracks.value.unshift(track)
  // Limit the list to a reasonable number (e.g., 20)
  if (recentlyPlayedTracks.value.length > 20) {
    recentlyPlayedTracks.value.length = 20
  }
  localStorage.setItem('wavebeat_recently_played', JSON.stringify(recentlyPlayedTracks.value))

  try {
    const response = await fetch(`${API_BASE_URL}/tracks/${track.id}/stream?app_name=${APP_NAME}`)
    if (!response.ok) throw new Error('Could not fetch stream URL')
    audioSrc.value = response.url
  } catch (error) {
    console.error('Failed to get track stream:', error)
    audioSrc.value = ''
    // Try playing the next song if the current one fails
    playNext()
  }
}

// --- LIKED SONGS LOGIC ---

const toggleLike = async (track) => {
  if (!user.value) {
    // If user is not logged in, maybe prompt them to sign up/login
    router.push('/login')
    return
  }

  const trackId = track.id
  const index = likedTrackIds.value.indexOf(trackId)

  if (index === -1) {
    likedTrackIds.value.push(trackId)
    await likeTrack(user.value.uid, trackId)
  } else {
    likedTrackIds.value.splice(index, 1)
    await unlikeTrack(user.value.uid, trackId)
  }
}

// --- PLAYLIST MODAL ---
const openAddToPlaylistModal = (track) => {
  trackForPlaylist.value = track
  isPlaylistModalVisible.value = true
}

const handlePlaylistCreated = (newPlaylist) => {
  userPlaylists.value.push(newPlaylist)
}

const handleTrackAddedToPlaylist = ({ playlistId, trackId }) => {
  const playlist = userPlaylists.value.find((p) => p.id === playlistId)
  if (playlist && !playlist.trackIds.includes(trackId)) {
    playlist.trackIds.push(trackId)
  }
}

const handlePlaylistDeleted = (playlistId) => {
  const index = userPlaylists.value.findIndex((p) => p.id === playlistId)
  if (index > -1) {
    userPlaylists.value.splice(index, 1)
  }
}

const handleProfileUpdated = (data) => {
  if (user.value) {
    user.value.displayName = data.displayName
  }
}

const handlePlayPlaylist = async (playlist) => {
  if (!playlist.trackIds || playlist.trackIds.length === 0) return

  try {
    const idParams = playlist.trackIds.map((id) => `id=${id}`).join('&')
    const response = await fetch(`${API_BASE_URL}/tracks?${idParams}&app_name=${APP_NAME}`)
    const result = await response.json()
    const tracks = playlist.trackIds
      .map((id) => result.data.find((t) => t.id === id))
      .filter(Boolean)

    playFromList({ sourceList: tracks, track: tracks[0] })
  } catch (error) {
    console.error('Failed to fetch playlist tracks for playback:', error)
  }
}

// --- PLAYER CONTROLS LOGIC ---

const toggleShuffle = () => {
  isShuffleActive.value = !isShuffleActive.value
}

const cycleRepeat = () => {
  const modes = ['off', 'all', 'one']
  const currentIndex = modes.indexOf(repeatMode.value)
  repeatMode.value = modes[(currentIndex + 1) % modes.length]
}

const toggleQueuePanel = () => {
  isQueuePanelVisible.value = !isQueuePanelVisible.value
}

// --- QUEUE & PLAYBACK LOGIC ---

const playFromList = ({ sourceList, track }) => {
  playQueue.value = [...sourceList]
  currentQueueIndex.value = playQueue.value.findIndex((t) => t.id === track.id)
  const trackToPlay = playQueue.value[currentQueueIndex.value]
  getTrackStream(trackToPlay)
}

const playFromQueueIndex = (index) => {
  currentQueueIndex.value = index
  const trackToPlay = playQueue.value[index]
  getTrackStream(trackToPlay)
}

const addToQueue = (track) => {
  playQueue.value.push(track)
  // If nothing is playing, start playing the added song.
  if (!currentTrack.value) {
    currentQueueIndex.value = playQueue.value.length - 1
    getTrackStream(track)
  }
}

const playNextInQueue = (track) => {
  if (currentQueueIndex.value === -1) {
    // If nothing is playing, just add it to the queue and play it.
    addToQueue(track)
  } else {
    // Insert the track right after the currently playing one.
    playQueue.value.splice(currentQueueIndex.value + 1, 0, track)
  }
}

const playNext = () => {
  if (playQueue.value.length === 0) return

  // Repeat-one has priority and is handled by the <audio> element's loop attribute.
  // If a track just ended and repeat-one is on, it will loop automatically.
  // We only need to intervene if the user *clicks* the next button.
  if (repeatMode.value === 'one') {
    getTrackStream(currentTrack.value) // Re-trigger the same song
    return
  }

  if (isShuffleActive.value) {
    // Play a random track from the queue, avoiding the current one if possible
    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * playQueue.value.length)
    } while (playQueue.value.length > 1 && randomIndex === currentQueueIndex.value)
    currentQueueIndex.value = randomIndex
  } else {
    // Move to the next track in order
    currentQueueIndex.value++
  }

  // Handle end of queue
  if (currentQueueIndex.value >= playQueue.value.length) {
    if (repeatMode.value === 'all') {
      currentQueueIndex.value = 0 // Loop back to the start
    } else {
      // Stop playback if we're at the end and not repeating
      currentTrack.value = null
      audioSrc.value = ''
      return
    }
  }

  getTrackStream(playQueue.value[currentQueueIndex.value])
}

const playPrevious = () => {
  if (currentQueueIndex.value > 0) {
    currentQueueIndex.value--
    const prevTrack = playQueue.value[currentQueueIndex.value]
    getTrackStream(prevTrack)
  }
}
</script>

<style>
/* Global styles */
:root {
  --bg-primary: #000000;
  --bg-secondary: #121212;
  --bg-elevation: #1a1a1a;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --brand-green: #1db954;
  --brand-green-hover: #1ed760;
}

body {
  margin: 0;
  background-color: var(--bg-primary);
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  padding-bottom: 120px; /* Make space for the fixed player */
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  padding: 0 1rem;
}

h1 {
  color: var(--text-primary);
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: -1px;
}

nav {
  display: flex;
  gap: 1rem;
  align-items: center;
}

nav a {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  transition:
    background-color 0.2s,
    color 0.2s;
}

nav a:hover {
  color: var(--text-primary);
}

nav a.signup-button {
  background-color: var(--brand-green);
  color: var(--bg-primary);
}

nav a.signup-button:hover {
  background-color: var(--brand-green-hover);
  color: var(--bg-primary);
}
</style>
