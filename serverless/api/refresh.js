require("dotenv").config();
const request = require("request");
const querystring = require("querystring");

module.exports = function (req, res) {
  console.log("refresh");
  console.log(process.env.SPOTIFY_CLIENT_ID);
  let refresh_token = req.query.refresh_token;
  let token = req.query.token;
  let options = {
    method: "POST",
    uri: "https://accounts.spotify.com/api/token",
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
      client_id: process.env.SPOTIFY_CLIENT_ID,
    },
    headers: {
      // Authorization: Basic <base64 encoded client_id:client_secret>
      Authorization: token,
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(
        querystring.stringify({
          grant_type: "refresh_token",
          refresh_token: refresh_token,
        })
      ),
    },
  };
  // asks for the code
  request.post(options, function (error, response, body) {
    if (error) {
      console.log(error);
    }
    console.log(body);
    var access_token = body && body.access_token;

    // res.redirect(
    //   `${FRONTEND_URI}${path}?access_token=${access_token}&refresh_token=${body.refresh_token}`
    // );
  });
};
