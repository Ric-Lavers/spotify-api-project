const cors = require('micro-cors')()
import get from 'lodash.get'
import {
  addTracksToTopTablePlaylist,
  getTopTablePlaylistById,
} from '../../../db/models/topTablePlaylists.model'

module.exports = cors(async function (req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.status(200)
      res.send()
      return
    }

    if (!req.query.spotify_user_id) {
      throw new Error('no spotify user id')
    }

    let playlist = await addTracksToTopTablePlaylist(
      req.query['top-table-playlist-id'],
      req.query.spotify_user_id,
      req.body.tracks,
      req.body.user
    )

    res.status(200).json(playlist)
  } catch (error) {
    console.log(error)
    res.status(400).send(error)
  }
})
