require('dotenv').config()
const querystring = require('querystring')

import { partyblendsPermissions } from '../config/permissions'
const REDIRECT_URI = require('../index').REDIRECT_URI

module.exports = function (req, res) {
  console.log('loggin in party blends')
  // asks for the code
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: partyblendsPermissions,
        redirect_uri: REDIRECT_URI,
        state: req.query.path,
        show_dialog: req.query.show_dialog || false,
      })
  )
}
