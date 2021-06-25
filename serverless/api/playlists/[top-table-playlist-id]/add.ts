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

    if (!req.query.spotify_user_id) throw new Error('no spotify user id')
    const time_range = req.query.time_range ? `-${req.query.time_range}` : ''

    let currentPlaylist = await getTopTablePlaylistById(
      req.query['top-table-playlist-id']
    )

    if (
      get(currentPlaylist, 'tracks[0].user_id', []).includes(
        `${req.query.spotify_user_id}${time_range}`
      )
    ) {
      res.status(200).json(currentPlaylist)
      return
    }

    let playlist = await addTracksToTopTablePlaylist(
      req.query['top-table-playlist-id'],
      `${req.query.spotify_user_id}${time_range}`,
      req.body.tracks
    )

    res.status(200).json(playlist)
  } catch (error) {
    res.status(400).send(error)
  }
})
