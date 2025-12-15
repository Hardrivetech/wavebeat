const API_KEY = import.meta.env.LASTFM_API_KEY
const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0/'

export async function handler(event) {
  // Get the artist name from the query string parameters
  const artistName = event.queryStringParameters.artist

  if (!artistName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Artist name is required' }),
    }
  }

  const url = `${LASTFM_API_BASE}?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${API_KEY}&format=json`

  try {
    const response = await fetch(url)
    const data = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch from Last.fm', details: error.message }),
    }
  }
}
