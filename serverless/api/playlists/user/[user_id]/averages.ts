const cors = require('micro-cors')()

import { getUsersTracksAverages } from '../../../../db/models/topTablePlaylists.model'

module.exports = cors(async function (req, res) {
  try {
    let averages = await getUsersTracksAverages(
      req.query['playlist-id'],
      req.query['user_id']
    )

    res.status(200).json(averages)
  } catch (error) {
    console.log('api/playlists/user/[user_id]/averages.ts', error)
    res.status(200).json([])
  }
})
