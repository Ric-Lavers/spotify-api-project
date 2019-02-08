require('dotenv').config()
const allPermisions = require('./config/permissions').allPermisions
let express = require('express')
let request = require('request')
let querystring = require('querystring')

let app = express()

const REDIRECT_URI = process.env.REDIRECT_URI

app.get('/login', function(req, res) {
  console.log( 'loggin in' )

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: allPermisions,
      redirect_uri: REDIRECT_URI
    }))
})

app.get('/callback', function(req, res) {
  console.log( 'callback' )
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: REDIRECT_URI,
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

let port = process.env.PORT || 4000
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)