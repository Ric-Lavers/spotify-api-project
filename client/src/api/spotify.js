import { LOGIN_URL } from '../helpers'
import { top_time_range, savedTracks } from '../constants'
import { getKey } from 'helpers/camelot'

const spotifyClientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID
const spotifyToken = sessionStorage.spotifyToken
const baseUrl = 'https://api.spotify.com/v1'
const headers = {
  headers: new Headers({
    Authorization: `Bearer ${spotifyToken}`,
    'Content-Type': 'application/json',
  }),
}

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

export const getHref = async (href) => {
  try {
    const res = await fetch(href, headers)
    isOk(res)

    return res.json()
  } catch (error) {
    console.error(error)
  }
}

export const refereshSpotifyLogin = async (
  refresh_token = sessionStorage.refresh_token
) => {
  try {
    let body = new URLSearchParams()
    body.append('grant_type', 'refresh_token')
    body.append('refresh_token', refresh_token)
    body.append('client_id', spotifyClientId)

    const data = await fetch('https://accounts.spotify.com/api/token', {
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      method: 'POST',
      body,
    }).then((d) => d.json())
  } catch (error) {
    console.error(error.message)
  }
}

/*
 * Params can be genre, year, artist, album, label
 */
export const searchSpotify = async (query, type, params = []) => {
  params = [
    `type=${type}`,
    ...Object.keys(params).map((k) => `${k}=${params[k]}`),
  ].join('&')
  const search = new URLSearchParams({
    q: query,
  }).toString()

  let res = await fetch(`${baseUrl}/search?${search}&${params}`, {
    headers: new Headers({
      Authorization: `Bearer ${spotifyToken}`,
      'Content-Type': 'application/json',
    }),
  })
  isOk(res)
  return res.json()
}
/* sort by year
albums.items.map(({artists, name, type, release_date}) => ({name, artists : artists[0].name, type,release_date})).sort((a,b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
*/

export const getMe = async () => {
  try {
    let res = await fetch(baseUrl + '/me', headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.error(error.message)
  }
}
export const getUser = async (user_id) => {
  try {
    let res = await fetch(baseUrl + `/users/${user_id}`, headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.error(error.message)
  }
}

export const checkToken = async (
  spotifyToken = sessionStorage.spotifyToken,
  redirect = false
) => {
  try {
    let res = await fetch(baseUrl + '/me', {
      headers: new Headers({
        Authorization: `Bearer ${spotifyToken}`,
        'Content-Type': 'application/json',
      }),
    })
    isOk(res)

    return res.json()
  } catch (error) {
    console.error(error.message)
    if (redirect) {
      window.location.replace(LOGIN_URL)
    }
    return error
  }
}

export const followMany = (ids, type) => {
  let queryIds = ids.splice(0, 50)
  if (ids.length) {
    followMany(ids)
  }
  follow(queryIds)
}

export const unFollow = async (ids, type) => {
  if (type !== 'artist' && type !== 'user') {
    console.error(type, 'bad type')
    return
  }
  let query = new URLSearchParams({
    type,
  }).toString()

  try {
    let res = await fetch(`${baseUrl}/me/following?${query}`, {
      ...headers,
      method: 'DELETE',
      body: JSON.stringify({
        ids: [].concat(ids),
      }),
    })
    isOk(res)
    return true
  } catch (error) {
    console.error(error.message)
    return false
  }
}
export const follow = async (ids, type) => {
  if (type !== 'artist' && type !== 'user') {
    console.error(type, 'bad type')
    return
  }
  let query = new URLSearchParams({
    type,
  }).toString()

  try {
    let res = await fetch(`${baseUrl}/me/following?${query}`, {
      ...headers,
      method: 'PUT',
      body: JSON.stringify({
        ids: [].concat(ids),
      }),
    })
    isOk(res)
    return true
  } catch (error) {
    console.error(error.message)
    return false
  }
}
export const getFollowingState = async (ids, type) => {
  if (type !== 'artist' && type !== 'user') {
    console.error(type, 'bad type')
    return
  }

  let query = new URLSearchParams({
    ids: ids.join(),
    type,
  }).toString()
  // type=${type}&ids
  try {
    let res = await fetch(`${baseUrl}/me/following/contains?${query}`, headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.error(error.message)
  }
}

export const getSavedState = async (ids, type) => {
  if (type !== 'track') {
    console.error(type, 'bad type')
    return
  }

  let query = new URLSearchParams({
    ids: [].concat(ids).join(),
    type,
  }).toString()
  // type=${type}&ids
  try {
    let res = await fetch(`${baseUrl}/me/tracks/contains?${query}`, headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.error(error.message)
  }
}

export const getPlaylistInfo = async (spotifyToken, ids) => {
  try {
    let res = await fetch(`${baseUrl}/tracks/?ids=${ids.join()}`, {
      headers: new Headers({
        Authorization: `Bearer ${spotifyToken}`,
        'Content-Type': 'application/json',
      }),
    })
    if (!res.ok) {
      throw Error(res.statusText)
    }
    return res.json()
  } catch (error) {
    console.error(error.message)
    return error
  }
}

export const getAlbumById = async (id) => {
  try {
    let res = await fetch(`${baseUrl}/albums/${id}`, headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.error(error.message)
  }
}
export const getAlbums = async (ids) => {
  try {
    let res = await fetch(`${baseUrl}/albums/?ids=${ids.join()}`, headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.error(error.message)
  }
}

export const getAlbumInfo = async (id) => {
  let spotifyToken = sessionStorage.spotifyToken
  try {
    let res = await fetch(`${baseUrl}/albums/${id}`, {
      headers: new Headers({
        Authorization: `Bearer ${spotifyToken}`,
        'Content-Type': 'application/json',
      }),
    })
    return res.json()
  } catch (error) {
    console.debug(error.message)
    return error
  }
}

export const getMePlaylists = async ({ limit = 50, offset = 0 } = {}) => {
  try {
    let res = await fetch(
      `${baseUrl}/me/playlists?limit=${limit}&offset=${offset}`,
      headers
    )
    isOk(res)
    const data = await res.json()
    if (data.next) {
      const items = await fetchNextItems(data.next)
      data.items = [...data.items, ...items]
    }

    return data
  } catch (error) {
    console.debug(error.message)
    return { items: [] }
  }
}

export const getPlaylistsTracks = async (listId) => {
  let url = `${baseUrl}/playlists/${listId}/tracks`
  try {
    let res = await fetch(url, headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.debug(error.message)
    return { items: [] }
  }
}
const fetchNextItems = async (next, items = []) => {
  const getNext = async () => {
    const data = await getHref(next)

    items = [...items, ...data.items]
    if (data.next) {
      return await fetchNextItems(data.next, items)
    } else {
      return items
    }
  }
  return await getNext()
}

export const getAllPlaylistsTracks = async (
  playlistId,
  removeIsLocal = true
) => {
  try {
    const isTopTrack = top_time_range
      .map(({ value }) => value)
      .includes(playlistId)
    const isSavedTracks = playlistId === savedTracks.id
    const data = await (isTopTrack
      ? getTopTracks({ time_range: playlistId })
      : isSavedTracks
      ? getMeSavedTracks()
      : getPlaylistsTracks(playlistId))

    if (data.next) {
      const items = await fetchNextItems(data.next)
      data.items = [...data.items, ...items]
      delete data.limit
    }
    if (removeIsLocal) {
      data.items = data.items.filter(({ is_local }) => !is_local)
    }
    if (isTopTrack) {
      return {
        ...data,
        items: data.items.map((track, i) => ({
          track: { ...track, order: i + 1 },
        })),
      }
    }
    data.items.forEach(({ track }, i) => {
      track.order = i + 1
    })
    return data
  } catch (error) {
    return { items: [] }
  }
}

export const createUserPlaylist = async (
  user_id,
  { name, description, isPublic = false, collaborative = false }
) => {
  try {
    let res = await fetch(`${baseUrl}/users/${user_id}/playlists`, {
      ...headers,
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
        collaborative,
      }),
    })

    isOk(res)
    const data = await res.json()

    return data
  } catch (error) {}
}
/**
 *
 * @param {string} playlist_id
 * @returns {snapshot_id: string}
 */
export const addTracksToPlaylist = async (playlist_id, uris) => {
  try {
    let res = await fetch(`${baseUrl}/playlists/${playlist_id}/tracks`, {
      ...headers,
      method: 'POST',
      body: JSON.stringify({
        uris,
      }),
    })

    isOk(res)
    const data = await res.json()

    return data
  } catch (error) {}
}

export const createUserPlaylistWithTracks = async (
  user_id,
  playlistData,
  uris
) => {
  try {
    const newPlaylist = await createUserPlaylist(user_id, playlistData)
    const playlist_id = newPlaylist.id

    const arrayOfUris = []
    for (let i = 0; i < uris.length; i += 100) {
      arrayOfUris.push(uris.slice(i, i + 100))
    }

    for (const uris of arrayOfUris) {
      let res = await fetch(`${baseUrl}/playlists/${playlist_id}/tracks`, {
        ...headers,
        method: 'POST',
        body: JSON.stringify({
          uris,
        }),
      })
      isOk(res)
    }

    const playlistTracks = await getAllPlaylistsTracks(playlist_id)

    return newPlaylist
  } catch (error) {}
}

export const getRecentlyPlayed = async () => {
  const spotifyToken = sessionStorage.spotifyToken
  try {
    let res = await fetch(`${baseUrl}/me/player/recently-played`, {
      headers: new Headers({
        Authorization: `Bearer ${spotifyToken}`,
        'Content-Type': 'application/json',
      }),
    })
    if (!res.ok) {
      throw Error(' res not ok ')
    }
    if (typeof res !== 'object') {
      throw Error('nothing is playing')
    }
    return res.json()
  } catch (error) {
    console.debug(error.message)
    return null
  }
}

export const controls = async (action, body = {}) => {
  const spotifyToken = sessionStorage.spotifyToken
  const method = action === 'play' || action === 'pause' ? 'PUT' : 'POST'
  try {
    const res = await fetch(`${baseUrl}/me/player/${action}`, {
      headers: new Headers({
        Authorization: `Bearer ${spotifyToken}`,
        'Content-Type': 'application/json',
      }),
      method: method,
      body: JSON.stringify({
        ...body,
      }),
    })
    if (!res.ok) {
      throw res
    }
    return true
  } catch (error) {
    console.log('controls failed', error.message)
    return false
  }
}

export const play = async (body = {}) => {
  if (body.uris) {
    body.uris = body.uris.filter((uri) => !uri.match('spotify:local'))

    // note sure why 775 is the limit, but i tested it and this was the number, maybe its a JSON size thing.. if so should minus a few to be safe.
    if (body.uris.length > 775 && body.offset) {
      const { position } = body.offset
      body.uris = body.uris.slice(position, 775 + position)
      body.offset.position = 0
    }
  }

  try {
    await fetch(`${baseUrl}/me/player/play`, {
      ...headers,
      method: 'PUT',
      body: JSON.stringify({
        ...body,
      }),
    })
    return true
  } catch (error) {
    console.debug(error.message)
    return error
  }
}
export const seek = async (queries = {}) => {
  const spotifyToken = sessionStorage.spotifyToken
  let query = new URLSearchParams(queries).toString()
  try {
    await fetch(`${baseUrl}/me/player/seek?${query}`, {
      headers: new Headers({
        Authorization: `Bearer ${spotifyToken}`,
        'Content-Type': 'application/json',
      }),
      method: 'PUT',
      // query: JSON.stringify({...queries})
    })
    return true
  } catch (error) {
    console.debug(error.message)
    return error
  }
}

export const currentPlaying = async () => {
  const spotifyToken = sessionStorage.spotifyToken

  let res = await fetch(`${baseUrl}/me/player/currently-playing`, {
    headers: new Headers({
      Authorization: `Bearer ${spotifyToken}`,
      'Content-Type': 'application/json',
    }),
  })
  is204(res)
  isOk(res)

  const data = res.json()
  return data
}

export const getMeSavedTracks = async () => {
  try {
    let res = await fetch(`${baseUrl}/me/tracks?limit=50`, headers)
    isOk(res)

    return res.json()
  } catch (err) {
    return []
  }
}
export const getMeSavedAlbums = async () => {
  try {
    let res = await fetch(`${baseUrl}/me/albums`, headers)
    isOk(res)

    return res.json()
  } catch (err) {
    return []
  }
}

export const saveTracks = async (ids) => {
  if ([].concat(ids).length > 50) {
    throw Error('max of 50 tracks can be saved at a time')
  }
  try {
    let res = await fetch(`${baseUrl}/me/tracks`, {
      ...headers,
      method: 'PUT',
      body: JSON.stringify({
        ids: [].concat(ids),
      }),
    })
    isOk(res)

    return true
  } catch (err) {
    return false
  }
}
export const removeTracks = async (ids) => {
  if (ids.length > 50) {
    throw Error('max of 50 tracks can be saved at a time')
  }
  try {
    let res = await fetch(`${baseUrl}/me/tracks`, {
      ...headers,
      method: 'DELETE',
      body: JSON.stringify({
        ids: [].concat(ids),
      }),
    })
    isOk(res)

    return true
  } catch (err) {
    return false
  }
}

export const getDevices = async () => {
  try {
    let res = await fetch(`${baseUrl}/me/player/devices`, headers)
    isOk(res)
    is204(res)
    return res.json()
  } catch (error) {
    console.error(error)
    return []
  }
}

export const transferDevice = async (deviceId) => {
  try {
    await fetch(`${baseUrl}/me/player`, {
      ...headers,
      method: 'PUT',
      body: JSON.stringify({
        device_ids: [deviceId],
      }),
    })
  } catch (error) {}
}

/**
 * gets the top tracks/ artists
 * *time_range*
 * 'long_term', // years
    'medium_term', // approx 6months (Default)
    'short_term', // approx 4weeks
 * max limit = 50
 * 
 */
export const getTopTracks = async (query = {}) => {
  query = new URLSearchParams({
    limit: 50,
    time_range: 'short_term',
    ...query,
  }).toString()

  let res = await fetch(`${baseUrl}/me/top/tracks?${query}`, headers)
  isOk(res)
  is204(res)
  return res.json()
}
export const getTopArtists = async (query = {}) => {
  query = new URLSearchParams({
    limit: 50,
    time_range: 'short_term',
    ...query,
  }).toString()

  let res = await fetch(`${baseUrl}/me/top/artists?${query}`, headers)
  isOk(res)
  is204(res)
  return res.json()
}
/**
 * Get Audio Features
 * https://developer.spotify.com/documentation/web-api/reference/tracks/get-several-audio-features/
 * @param {(number|number[])} trackIds -  max=100
 */
export const getAudioFeatures = async (trackIds) => {
  let res = await fetch(
    `${baseUrl}/audio-features?ids=[${[].concat(trackIds).join()}]`,
    headers
  )
  isOk(res)
  is204(res)
  return res.json()
}
export const getOneAudioFeatures = async (trackId) => {
  let res = await fetch(`${baseUrl}/audio-features/${trackId}`, headers)
  isOk(res)
  is204(res)
  return res.json()
}
export const getManyAudioFeatures = async (trackIds) => {
  let res = await fetch(`${baseUrl}/audio-features?ids=${trackIds}`, headers)
  isOk(res)
  is204(res)
  let data = await res.json()
  data = {
    ...data,
    audio_features: data.audio_features.map((af) => ({
      ...af,
      camelot: `${
        getKey({
          mode: af['mode'],
          pitchClass: af['key'],
        }).camelotPosition
      }${af['mode'] === 1 ? 'B' : 'A'}`,
    })),
  }

  return data
}
export const getHeapsAudioFeatures = async (trackIds) => {
  const arrayOfIds = []
  for (let i = 0; i < trackIds.length; i += 100) {
    arrayOfIds.push(trackIds.slice(i, i + 100))
  }

  let res = await Promise.all(
    arrayOfIds.map((ids) => getManyAudioFeatures(ids))
  )

  return res.reduce((a, { audio_features }) => [...a, ...audio_features], [])
}

const getManyTracks = async (trackIds) => {
  const _trackIds = trackIds.filter(Boolean)

  let res = await fetch(`${baseUrl}/tracks?ids=${_trackIds}`, headers)
  isOk(res)
  is204(res)
  return res.json()
}

export const getHeapsTracks = async (trackIds) => {
  const arrayOfIds = []
  for (let i = 0; i < trackIds.length; i += 50) {
    arrayOfIds.push(trackIds.slice(i, i + 50))
  }
  let res = await Promise.all(arrayOfIds.map((ids) => getManyTracks(ids)))

  return res.reduce((a, c) => {
    a.tracks.concat(c.tracks)
    return { tracks: [...a.tracks, ...c.tracks] }
  })
}

export const getArtists = async (artistIds) => {
  let res = await fetch(`${baseUrl}/artists?ids=${artistIds}`, headers)
  isOk(res)
  is204(res)
  return res.json()
}

export default {
  getMe,
  checkToken,
  getPlaylistInfo,
  getAlbumInfo,
  getAlbumById,
  getMePlaylists,
  getPlaylistsTracks,
  getRecentlyPlayed,
  searchSpotify,
  controls,
  play,
  seek,
  currentPlaying,
  getFollowingState,
  getSavedState,
  saveTracks,
  removeTracks,
  getDevices,
  getMeSavedTracks,
  getMeSavedAlbums,
  getTopArtists,
  getTopTracks,
  getAudioFeatures,
  getHeapsTracks,
  getArtists,
}

/* "spotify:track:7ltD8Tp0wKA34z8ExG0YJI","spotify:track:2hmUAnx8nGqocCsc350Lom","spotify:track:0FTMZs0lK0MbQsSjQKjCqv","spotify:track:7t2SwkamdQdGfJ7vLnXVtt","spotify:track:5RpoUzFpBM0EMSet3Mzldw","spotify:track:6AVTjl22jUxYiX3XP7EJTN","spotify:track:4A5K595Tum7F8EoYGJCtPI","spotify:track:0WgSsCo3zWzkaHY0JlMoi9","spotify:track:2jgvOyKOFyHtW11hlqOkUB","spotify:track:62mS1P3KoKfuDEglyT7wuo","spotify:track:54wkv0gYaFNbH97DTENlii","spotify:track:1iB6ug1ikOFFLpGI4Nc5Lv","spotify:track:17Jj6ulM2flr3O8zoIiKC6","spotify:track:6x71guQ6FQsyefFN3toj4n","spotify:track:4tDQj3b5xeKO5GRB5VJqip","spotify:track:14XSTI6JmWf0WsNBMHSW6G","spotify:track:7ouFj4hwlNMt0IAUdb0ubG","spotify:track:3mB6zdyTR97UVr7dGqqWts","spotify:track:3Y4R7XqTEPLcSbw46DrKnO","spotify:track:2veEIrSGcCszmVKyEuiIVd","spotify:track:34ywBstvC6knYlFm5VbaaO","spotify:track:3YJtbOl2PNvvSl8XvvUpRa","spotify:track:5KO0cE3VWGIPqkXi8HDXJ2","spotify:track:4Qf2BluUlCIi8tIXfnTPqt","spotify:track:7hNOk1cGljgIB44Pisy9tw","spotify:track:4xyidZEkDQ5iuY4vU1KtX4","spotify:track:0kVNpc8MOTj8ZPFKePVfm5","spotify:track:1AFHsjtCh5M3PPPr2Dtzh5","spotify:track:4SYGUxGCAV7cB6UWtHqAG0","spotify:track:565KdpRIKqe1zlclAcOBx3","spotify:track:6FvJujsc00pC1umLOUN9gK","spotify:track:2a6g78BXxieE2Yg0m91DHF","spotify:track:0tpho5AS8b6adlsHfJIrsN","spotify:track:3IaLsmMGxzPlZvdj1olHzM","spotify:track:1EeypF08LPlKpgT2kcLixB","spotify:track:01iglyLhCYZYlCqAxY8Vfz","spotify:track:6ILY97rvLDplKnuOcnZf7e","spotify:track:7qSTy4Qfzve3ZGAtsnWGLz","spotify:track:4LYNY4dkuqZr1yv4OLioyY","spotify:track:3lLcEArhIl5jYJYNnV7Xph","spotify:track:470wLyjYbOBdR89RaAUkxT","spotify:track:7xB6q501pjADLOIBO55NPp","spotify:track:5e3KCTkAZVUSS2ZfuiuTuy","spotify:track:7EIMEIJRjWJpYmJCd5pwuN","spotify:track:5yTYVsQPA7ujLOANcjdDTW","spotify:track:7pa7G9qszdLfdkrFIdhgIw","spotify:track:3Waz6eXBUPZYZBNqZZruyM","spotify:track:1YV1bvMBjZuhp4syPdKJxU","spotify:track:0zdyHkf7N2JIuuzrjLQStd","spotify:track:7qAd8DblDg1luQ8qnRJOmh","spotify:track:2bpaN47ADM6pnjABmNlCTv","spotify:track:2NRJzI8RiMaCFqRzTFUgxq","spotify:track:6YQ0EXjwQWT263njOeoe8S","spotify:track:4cfr1WuhlXvWZT8QYJsIJQ","spotify:track:5uPkZGZpAKlQh0QZWXeGY3","spotify:track:66NQDt4mIWTiuweduWzV6V","spotify:track:2nonAYGrtN6R6MmzIWwJjf","spotify:track:5TaJDVZLSreKLg31wRR284","spotify:track:3vUcFxnOlGWpG2NjTjGrsv","spotify:track:3q1oYpNQBoYsJzjhBDZ3yr","spotify:track:1USgq7cy0f4dzNJG9WHWmR","spotify:track:5n9ml1SgCn0CLLYoHr7RlI","spotify:track:1VJC2cp8lqk8zTEujQDWPu","spotify:track:3VCZmy8zxp1Bz7BQYTqEIS","spotify:track:4SJbP61kwGbrjFABXlhprD","spotify:track:7CPTgN9dwI56YfYs1YDlCy","spotify:track:57LzKQoQDo4hWv7tdf894l","spotify:track:4lN4yjHbNl27kDHm2dSpqK","spotify:track:6eM5mq1xnuvB6NWGOSBp84","spotify:track:0Pt4TBaEaUmzU5QW2IE7VN","spotify:track:0WTHV035dKzHDblPFduJll","spotify:track:3Jh6eYEVu0H0fxZCrihisA" */
