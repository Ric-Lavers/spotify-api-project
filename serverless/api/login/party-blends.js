require('dotenv').config()
const querystring = require('querystring')

import { partyblendsPermissions } from '../config/permissions'

module.exports = function (req, res) {
  console.log('loggin in to party blends')
  // asks for the code
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: partyblendsPermissions,
        redirect_uri: process.env.REDIRECT_URI,
        state: req.query.path,
        show_dialog:  req.query.show_dialog || false,
      })
  )
}
