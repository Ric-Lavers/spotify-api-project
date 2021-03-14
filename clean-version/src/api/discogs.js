import querystring from "querystring";

const TOKEN = process.env.REACT_APP_DISCOGS_TOKEN;
const baseUrl = "https://api.discogs.com";

const {
  discogsConsumerKey,
  // discogsConsumerSecret,
  discogsToken
  // discogsTokenSecret
} = sessionStorage;

const oAuth1 = querystring.stringify({
  oauth_consumer_key: discogsConsumerKey,
  // discogsConsumerSecret,
  oauth_token: discogsToken,
  discogsTokenSecret: "HMAC-SHA1"
  // oauth_signature_method:
});

if (!discogsToken) console.error("no discogs token found");
const headers = {
  headers: new Headers({
    Authorization: `Discogs token=${discogsToken}`,
    "Content-Type": "application/json"
  })
};

export const identity = async () => {
  try {
    let res = await fetch(`https://api.discogs.com/oauth/identity?${oAuth1}`);

    return res.json();
  } catch (error) {
    throw error;
  }
};

export const searchDiscogs = async queryObj => {
  const query = new URLSearchParams({
    ...queryObj,
    token: TOKEN
  }).toString();
  try {
    let res = await fetch(`https://api.discogs.com/database/search?${query}`);
    return res.json();
  } catch (error) {
    throw error;
  }
};

export const labelReleases = async (labelId, queryObj) => {
  const query = new URLSearchParams({
    ...queryObj
  }).toString();
  try {
    let res = await fetch(
      `https://api.discogs.com/labels/${labelId}/releases?${query}`
    );
    return res.json();
  } catch (error) {
    throw error;
  }
};

export const getAccessToken = async oauthToken => {
  try {
    let res = await fetch(`https://api.discogs.com/oauth/access_token`, {
      headers: new Headers({
        oauth_consumer_key: "zWqDQEdZNBUyXWjTcySJ",
        oauth_nonce: "abc123",
        oauth_token: oauthToken,
        oauth_signature: "emdlIndOzbVmKcLjNbEaZlgkDvPjcskT",
        oauth_signature_method: "PLAINTEXT",
        oauth_timestamp: "current_timestamp",
        oauth_verifier: "users_verifier"
      })
    });
    return res.json();
  } catch (error) {
    throw error;
  }
};

export const collectionValue = async (labelId, queryObj) => {
  // const query = new URLSearchParams({
  //   ...queryObj
  // }).toString()
  const username = "ric";

  try {
    let res = await fetch(
      `${baseUrl}/users/${username}/collection/value`,
      headers
    );
    return res.json();
  } catch (error) {
    throw error;
  }
};
