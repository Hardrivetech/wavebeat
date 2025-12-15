<template>
  <header>
    <h1 @click="goHome" style="cursor: pointer;">🎵 WaveBeat</h1>
  </header>

  <main>
    <SearchBar @search="searchTracks" />
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else>
      <!-- Show search results if they exist -->
      <TrackList
        v-if="tracks.length > 0"
        :tracks="tracks"
        title="Search Results"
        :has-searched="hasSearched"
        :liked-track-ids="likedTrackIds"
        @play-track="playFromList(tracks, $event)"
        @add-to-queue="addToQueue"
        @play-next="playNextInQueue"
        @toggle-like="toggleLike"
      />
      <!-- Otherwise, show discovery content -->
      <div v-else>
        <TrackList
          v-if="likedTracks.length > 0"
          :tracks="likedTracks"
          title="💚 Liked Songs"
          :liked-track-ids="likedTrackIds"
          @play-track="playFromList(likedTracks, $event)"
          @add-to-queue="addToQueue"
          @play-next="playNextInQueue"
          @toggle-like="toggleLike"
        />
        <TrackList
          :tracks="trendingTracks"
          title="🔥 Trending on Audius"
          :liked-track-ids="likedTrackIds"
          @play-track="playFromList(trendingTracks, $event)"
          @add-to-queue="addToQueue"
          @play-next="playNextInQueue"
          @toggle-like="toggleLike"
        />
      </div>
    </div>
  </main>

  <AudioPlayer 
    :track="currentTrack" 
    :audio-src="audioSrc" 
    :liked-track-ids="likedTrackIds"
    :is-shuffle-active="isShuffleActive"
    :repeat-mode="repeatMode"
    @track-ended="playNext" @play-next="playNext" @play-previous="playPrevious"
    @toggle-like="toggleLike"
    @toggle-shuffle="toggleShuffle"
    @cycle-repeat="cycleRepeat"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import SearchBar from './components/SearchBar.vue';
import TrackList from './components/TrackList.vue';
import AudioPlayer from './components/AudioPlayer.vue';

// You should get your own App Name from Audius for a real app, but 'wavebeat-demo' is fine for now.
const APP_NAME = 'wavebeat-demo';
const API_BASE_URL = 'https://discoveryprovider.audius.co/v1';

const tracks = ref([]);
const trendingTracks = ref([]);
const playQueue = ref([]);
const currentQueueIndex = ref(-1);
const currentTrack = ref(null);
const audioSrc = ref('');
const isLoading = ref(false);
const hasSearched = ref(false);
const likedTrackIds = ref([]);
const isShuffleActive = ref(false);
const repeatMode = ref('off'); // 'off', 'all', 'one'

const likedTracks = computed(() => {
  // Create a pool of all unique tracks from different sources
  const allTracks = [...trendingTracks.value, ...tracks.value, ...playQueue.value];
  const uniqueTracks = [...new Map(allTracks.map(item => [item['id'], item])).values()];
  // Filter this pool to get the full track objects for our liked IDs
  return uniqueTracks.filter(track => likedTrackIds.value.includes(track.id));
});

// --- API & DATA FETCHING ---

onMounted(() => {
  // Load liked songs from localStorage on startup
  const savedLikes = localStorage.getItem('wavebeat_liked_songs');
  if (savedLikes) {
    likedTrackIds.value = JSON.parse(savedLikes);
  }
  fetchTrendingTracks();
});

const goHome = () => {
  // Clear search results to return to the home/discover view
  tracks.value = [];
  hasSearched.value = false;
};

const fetchTrendingTracks = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/tracks/trending?app_name=${APP_NAME}`);
    if (!response.ok) throw new Error('Failed to fetch trending tracks');
    const result = await response.json();
    trendingTracks.value = result.data || [];
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const searchTracks = async (query) => {
  isLoading.value = true;
  hasSearched.value = true;
  tracks.value = []; // Clear previous results
  try {
    const response = await fetch(
      `${API_BASE_URL}/tracks/search?query=${encodeURIComponent(query)}&app_name=${APP_NAME}`
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const result = await response.json();
    tracks.value = result.data || [];
  } catch (error) {
    console.error('Failed to search tracks:', error);
    tracks.value = []; // Ensure tracks are empty on error
  } finally {
    isLoading.value = false;
  }
};

const getTrackStream = async (track) => {
  if (!track) {
    audioSrc.value = '';
    currentTrack.value = null;
    return;
  }
  currentTrack.value = track;
  try {
    const response = await fetch(
      `${API_BASE_URL}/tracks/${track.id}/stream?app_name=${APP_NAME}`
    );
    if (!response.ok) throw new Error('Could not fetch stream URL');
    audioSrc.value = response.url;
  } catch (error) {
    console.error('Failed to get track stream:', error);
    audioSrc.value = '';
    // Try playing the next song if the current one fails
    playNext();
  }
};

// --- LIKED SONGS LOGIC ---

const toggleLike = (track) => {
  const trackId = track.id;
  const index = likedTrackIds.value.indexOf(trackId);
  if (index === -1) {
    likedTrackIds.value.push(trackId);
  } else {
    likedTrackIds.value.splice(index, 1);
  }
  // Save the updated list to localStorage
  localStorage.setItem('wavebeat_liked_songs', JSON.stringify(likedTrackIds.value));
};

// --- PLAYER CONTROLS LOGIC ---

const toggleShuffle = () => {
  isShuffleActive.value = !isShuffleActive.value;
};

const cycleRepeat = () => {
  const modes = ['off', 'all', 'one'];
  const currentIndex = modes.indexOf(repeatMode.value);
  repeatMode.value = modes[(currentIndex + 1) % modes.length];
};

// --- QUEUE & PLAYBACK LOGIC ---

const playFromList = (sourceList, { track, index }) => {
  // The source list (trending or search) becomes the new queue.
  playQueue.value = [...sourceList];
  currentQueueIndex.value = sourceList.findIndex(t => t.id === track.id);
  const trackToPlay = playQueue.value[currentQueueIndex.value];
  getTrackStream(trackToPlay);
};

const addToQueue = (track) => {
  playQueue.value.push(track);
  // If nothing is playing, start playing the added song.
  if (!currentTrack.value) {
    currentQueueIndex.value = playQueue.value.length - 1;
    getTrackStream(track);
  }
};

const playNextInQueue = (track) => {
  if (currentQueueIndex.value === -1) {
    // If nothing is playing, just add it to the queue and play it.
    addToQueue(track);
  } else {
    // Insert the track right after the currently playing one.
    playQueue.value.splice(currentQueueIndex.value + 1, 0, track);
  }
};

const playNext = () => {
  if (playQueue.value.length === 0) return;

  if (isShuffleActive.value) {
    // Play a random track from the queue, avoiding the current one if possible
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * playQueue.value.length);
    } while (playQueue.value.length > 1 && randomIndex === currentQueueIndex.value);
    currentQueueIndex.value = randomIndex;
    getTrackStream(playQueue.value[currentQueueIndex.value]);
    return;
  }

  const isAtEndOfQueue = currentQueueIndex.value >= playQueue.value.length - 1;

  if (!isAtEndOfQueue) {
    currentQueueIndex.value++;
    const nextTrack = playQueue.value[currentQueueIndex.value];
    getTrackStream(nextTrack);
  } else if (repeatMode.value === 'all') {
    currentQueueIndex.value = 0;
    getTrackStream(playQueue.value[0]);
  }
};

const playPrevious = () => {
  if (currentQueueIndex.value > 0) {
    currentQueueIndex.value--;
    const prevTrack = playQueue.value[currentQueueIndex.value];
    getTrackStream(prevTrack);
  }
};

</script>

<style>
/* Global styles */
:root {
  --bg-primary: #121212;
  --bg-secondary: #181818;
  --bg-elevation: #282828;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --brand-green: #1db954;
  --brand-green-hover: #1ed760;
}

body {
  background-color: var(--bg-primary);
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  padding-bottom: 120px; /* Make space for the fixed player */
}

header {
  text-align: left;
  margin-bottom: 2rem;
}

h1 {
  color: var(--text-primary);
  font-size: 2.5rem;
  font-weight: 900;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  color: var(--text-secondary);
  padding: 3rem;
}
</style>
