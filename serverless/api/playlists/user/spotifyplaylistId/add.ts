const cors = require('micro-cors')()

import { saveSpotifyPlaylistId } from '../../../../db/models/topTablePlaylists.model'

module.exports = cors(async function (req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.status(200)
      res.send()
      return
    }

    const userId = req.body['user_id']
    const playlistId = req.body['playlist_id']
    const spotifyPlaylistId = req.body['spotify_playlist_id']
    const sort_key = req.body['sort_key']
    let spotifyLinkids = await saveSpotifyPlaylistId(
      userId,
      playlistId,
      spotifyPlaylistId,
      sort_key
    )

    res.status(200).json(spotifyLinkids)
  } catch (error) {
    console.log('api/playlists/[top-table-playlist-id]/[user_id].ts', error)
    res.status(200).json([])
  }
})
