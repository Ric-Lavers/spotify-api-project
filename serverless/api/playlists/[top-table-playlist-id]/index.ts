const cors = require('micro-cors')()

import { getTopTablePlaylistById } from '../../../db/models/topTablePlaylists.model'

module.exports = cors(async function (req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.status(200)
      res.send()
      return
    }
    let { sort, direction, limit } = req.query
    if (limit) limit = parseInt(limit)

    let playlist = await getTopTablePlaylistById(
      req.query['top-table-playlist-id'],
      sort,
      direction,
      limit
    )

    res.status(200).json(playlist)
  } catch (error) {
    console.log('api/playlists/all.ts', error)

    res.status(400).send(error)
  }
})
