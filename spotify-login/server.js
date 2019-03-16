require('dotenv').config()
const request = require("request");

const Discogs = require('disconnect').Client;
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');

const allPermisions = require('./config/permissions').allPermisions
let express = require('express')
let querystring = require('querystring')

let app = express()

// set dev and prod variables below
const REDIRECT_URI = process.env.ENV ==='dev'
  ? 'http://localhost:4000/callback'
  : process.env.REDIRECT_URI
console.log(process.env.ENV, REDIRECT_URI, process.env.REDIRECT_URI)

const DISCOGS_CONSUMER_KEY= process.env.DISCOGS_CONSUMER_KEY
const DISCOGS_CONSUMER_SECRET= process.env.DISCOGS_CONSUMER_SECRET

/* SPOTIFY */

app.get('/login', function(req, res) {
  console.log( 'loggin in' )
  // asks for the code
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: allPermisions,
      redirect_uri: REDIRECT_URI
    }))
})

app.get('/callback', function(req, res) {
  console.log( 'callback' , req.query)
  //Recieves the code
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
    let uri = process.env.ENV === 'dev' ? 'http://localhost:3000' : proccess.env.FRONTEND_URI
    res.redirect(uri + '?access_token=' + access_token)
  })
})

/* DISCOGS */


var dis = new Discogs({
	consumerKey: DISCOGS_CONSUMER_KEY, 
	consumerSecret: DISCOGS_CONSUMER_SECRET,
});

const oauth = OAuth({
  consumer: { key: DISCOGS_CONSUMER_KEY, secret: DISCOGS_CONSUMER_SECRET+'&'},
  signature_method: 'PLAINTEXT'
});
console.log( process.env.ENV )

app.get('/---callback/discogs', (req, res) => {
  const oauth = JSON.parse(req.query)
  var options = {
    method: 'GET',
    url: 'https://api.discogs.com/oauth/request_token',
    qs: 
    { oauth_consumer_key: DISCOGS_CONSUMER_KEY,
      oauth_token: oauth.oauth_token,
      oauth_signature_method: 'PLAINTEXT',
      oauth_timestamp: Date.now(),
      oauth_nonce:  Math.floor((Math.random()*100000000)).toString(32),
      oauth_version: '1.0',
      oauth_signature: DISCOGS_CONSUMER_SECRET,
      [oauth.oauth_verifier]: '' 
    },
    headers: { 
      'Cache-Control': 'no-cache',
      oauth_timestamp: 'current_timestamp',
      oauth_signature_method: 'PLAINTEXT',
      oauth_signature: DISCOGS_CONSUMER_KEY,
      oauth_consumer_key: DISCOGS_CONSUMER_SECRET,
      Authorization: 'OAuth',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  
  // request(options, function (error, response, body) {
  //   if (error) throw new Error(error);
  //   console.log("BODY" )
  //   body.json()
  //   console.log( body )
  //   console.log(body.authorizeUrl);
  // });
  
})

app.get('/authorize/discogs', function(req, res){
  var oAuth = new Discogs().oauth();
  
	oAuth.getRequestToken(
		process.env.DISCOGS_CONSUMER_KEY, 
		process.env.DISCOGS_CONSUMER_SECRET, 
		'http://localhost:4000/callback/discogs', 
		function(err, requestData){
      // console.log(Object.keys(requestData), requestData)
      var requestData = requestData
			// Persist "requestData" here so that the callback handler can 
      // access it later after returning from the authorize url
      console.log( requestData.authorizeUrl )
			res.redirect(requestData.authorizeUrl);
		}
	);
}); 

app.get('/callback/discogs', async function(req, res){
  console.log( '/callback/discogs' , JSON.stringify(req.query))
  var oAuth = new Discogs(req.query).oauth();
	const token = await oAuth.getAccessToken(
		req.query.oauth_verifier, // Verification code sent back by Discogs
		function(err, accessData){
      console.log( "accessData: ",accessData )
			// Persist "accessData" here for following OAuth calls 
			res.send('Received access token!');
		}
  );
  console.log({token})
});
/* end Discogs */

let port = process.env.PORT || 4000
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)