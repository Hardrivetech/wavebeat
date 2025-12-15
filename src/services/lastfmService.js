const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0/'
const API_KEY = import.meta.env.VITE_LASTFM_API_KEY

/**
 * Fetches artist information from the Last.fm API.
 * @param {string} artistName The name of the artist.
 * @returns {Promise<object|null>} The artist object from Last.fm or null.
 */
export const getArtistInfo = async (artistName) => {
  try {
    const response = await fetch(
      `${LASTFM_API_BASE}?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${API_KEY}&format=json`,
    )
    if (!response.ok) throw new Error('Failed to fetch from Last.fm')
    const data = await response.json()
    return data.artist || null
  } catch (error) {
    console.error('Error fetching artist info from Last.fm:', error)
    return null
  }
}
