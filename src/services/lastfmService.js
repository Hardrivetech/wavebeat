/**
 * Fetches artist information from the Last.fm API.
 * @param {string} artistName The name of the artist.
 * @returns {Promise<object|null>} The artist object from Last.fm or null.
 */
export const getArtistInfo = async (artistName) => {
  try {
    // Call our own serverless function instead of the public API
    const response = await fetch(
      `/.netlify/functions/getArtistInfo?artist=${encodeURIComponent(artistName)}`,
    )
    if (!response.ok) throw new Error('Failed to fetch from Last.fm')
    const data = await response.json()
    return data.artist || null
  } catch (error) {
    console.error('Error fetching artist info from Last.fm:', error)
    return null
  }
}
