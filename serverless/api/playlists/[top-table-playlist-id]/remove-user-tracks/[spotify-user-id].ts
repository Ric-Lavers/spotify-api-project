const cors = require('micro-cors')()
import { removeUserTracksFromPlaylist } from '../../../../db/models/topTablePlaylists.model'

module.exports = cors(async function (req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.status(200)
      res.send()
      return
    }

    if (!req.query['spotify-user-id']) throw new Error('no spotify user id')

    let playlist = await removeUserTracksFromPlaylist(
      req.query['top-table-playlist-id'],
      req.query['spotify-user-id'],
      req.body && req.body.tracks
    )

    res.status(200).json(playlist)
  } catch (error) {
    console.log(error)
    res.status(400).send(error)
  }
})
