const cors = require('micro-cors')()
import get from 'lodash.get'
import {
  addTracksToTopTablePlaylist,
  getTopTablePlaylistById,
  enforceUserLimit,
} from '../../../db/models/topTablePlaylists.model'

module.exports = cors(async function (req, res, next) {
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

    enforceUserLimit(currentPlaylist.users, currentPlaylist.user_ids)
    // if (
    //   get(currentPlaylist, 'tracks[0].user_id', []).includes(
    //     `${req.query.spotify_user_id}${time_range}`
    //   )
    // ) {
    //   res.status(200).json(currentPlaylist)
    //   return
    // }

    let playlist = await addTracksToTopTablePlaylist(
      req.query['top-table-playlist-id'],
      `${req.query.spotify_user_id}${time_range}`,
      req.body.tracks,
      req.body.user
    )

    res.status(200).json(playlist)
  } catch (error) {
    console.log(123, error)
    res.status(507)
    res.send({ message: error.message })
  }
})
