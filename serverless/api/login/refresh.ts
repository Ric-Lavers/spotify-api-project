const request = require('request')
const cors = require('micro-cors')()

module.exports = cors(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200)
    res.send()
    return
  }

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
            ':' +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'),
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: req.query.refresh_token,
    },
    json: true,
  }

  request.post(authOptions, function (error, response, body) {
    if (!error && body) {
      var access_token = body.access_token

      res.send({
        access_token: access_token,
      })
      return
    }

    res.status(400).send(error || body)
  })
})
