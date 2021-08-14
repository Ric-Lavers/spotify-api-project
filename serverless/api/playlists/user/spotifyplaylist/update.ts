const cors = require('micro-cors')()

import { saveSpotifyPlaylistId } from '../../../../db/models/topTablePlaylists.model'

module.exports = cors(async function (req, res) {
  try {
    const userId = req.body['user_id']
    const playlistId = req.body['playlist_id']
    const spotifyPlaylistId = req.body['spotify_playlist_id']
    let playlist = await saveSpotifyPlaylistId(
      userId,
      playlistId,
      spotifyPlaylistId
    )

    res.status(200).json(playlist)
  } catch (error) {
    console.log('api/playlists/[top-table-playlist-id]/[user_id].ts', error)
    res.status(200).json([])
  }
})
