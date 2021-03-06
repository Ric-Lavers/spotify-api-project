const spotifyClientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID
const baseServerUrl = process.env.REACT_APP_BASE_SERVER_URL
const spotifyToken = sessionStorage.spotifyToken
const baseUrl = 'https://api.spotify.com/v1'
const headers = new Headers({
  Authorization: `Bearer ${spotifyToken}`,
  'Content-Type': 'application/json',
})

const isOk = (res) => {
  if (!res.ok) {
    throw Error(res.statusText)
  }
}
const is204 = (res) => {
  if (res.status === 204) {
    throw Error('is 204')
  }
}

export const serverFetch = (href, options) => {
  return fetch(baseServerUrl + href, {
    headers,
    ...options,
  }).then((res) => {
    isOk(res)
    return res.json()
  })
}

export const junoFetch = (href, options) => {
  return fetch(baseServerUrl + 'juno/' + href, {
    ...options,
  })
}

export const beatportFetch = (href, options) => {
  return fetch(baseServerUrl + 'beatport/' + href, {
    ...options,
  })
}

export const discogsFetch = (href, options) => {
  return fetch(baseServerUrl + 'discogs/' + href, {
    ...options,
  })
}
