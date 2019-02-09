require('dotenv').config()
let express = require('express')
let request = require('request')
let querystring = require('querystring')

const authScope = [
	'playlist-read-private',
	'playlist-modify-private',
	'playlist-modify-public',
	'playlist-read-collaborative',
	'user-modify-playback-state',
	'user-read-currently-playing',
	'user-read-playback-state',
	'user-top-read',
	'user-read-recently-played',
	'app-remote-control',
	'user-read-birthdate',
	'user-read-email',
	'user-read-private',
	'user-follow-read',
	'user-follow-modify',
	'user-library-modify',
	'user-library-read',
]

let app = express()
let port = process.env.PORT || 4000
let redirect_uri = 
  process.env.REDIRECT_URI || 
  `http://localhost:${port}/callback`

app.get('/login', function(req, res) {
  console.log('login')
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: authScope.join(' '),
      redirect_uri
    }))
})

app.get('/callback', function(req, res) {
  console.log('callback')
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token
    let uri = process.env.FRONTEND_URI || 'http://localhost:3000'
    res.redirect(uri + '?access_token=' + access_token)
  })
})

console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)