const cors = require('micro-cors')()

import { getSpotifyLinksForPlaylist } from '../../../../db/models/topTablePlaylists.model'

module.exports = cors(async function (req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.status(200)
      res.send()
      return
    }

    const userId = req.body['user_id']
    const playlistId = req.body['playlist_id']

    let spotifyLinkids = await getSpotifyLinksForPlaylist(userId, playlistId)

    res.status(200).json(spotifyLinkids)
  } catch (error) {
    console.log('api/playlists/[top-table-playlist-id]/[user_id].ts', error)
    res.status(200).json([])
  }
})
