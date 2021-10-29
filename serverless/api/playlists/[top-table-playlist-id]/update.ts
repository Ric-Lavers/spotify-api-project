const cors = require('micro-cors')()
import get from 'lodash.get'
import {
  updateTracksToTopTablePlaylist,
  getTopTablePlaylistById,
} from '../../../db/models/topTablePlaylists.model'

module.exports = cors(async function (req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.status(200)
      res.send()
      return
    }

    if (!req.query.spotify_user_id) throw new Error('no spotify user id')
    let currentPlaylist = await getTopTablePlaylistById(
      req.query['top-table-playlist-id'],
      req.query.spotify_user_id
    )

    if (
      get(currentPlaylist, 'user_ids', []).includes(req.query.spotify_user_id)
    ) {
      let playlist = await updateTracksToTopTablePlaylist(
        req.query['top-table-playlist-id'],
        req.query.spotify_user_id,
        req.body.tracks,
        req.body.user
      )

      res.status(200).json(playlist)
      return
    }
    throw new Error('user does not exist')
  } catch (error) {
    console.log('err', error)

    res.status(400).send(error)
  }
})
