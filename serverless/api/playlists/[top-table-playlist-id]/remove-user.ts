const cors = require('micro-cors')()

import {
  removeUserTracksFromPlaylist,
  removeUserFromPlaylist,
} from '../../../db/models/topTablePlaylists.model'

module.exports = cors(async function (req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.status(200)
      res.send()
      return
    }

    const { user_id } = req.body
    if (!user_id) throw new Error('no spotify user id')

    let details = await removeUserTracksFromPlaylist(
      req.query['top-table-playlist-id'],
      user_id
    )
    let details2 = await removeUserFromPlaylist(
      req.query['top-table-playlist-id'],
      user_id
    )

    res.status(200).json([details, details2])
  } catch (error) {
    console.log(error)
    res.status(400).send(error)
  }
})
