//@flow
import { LOGIN_URL } from  '../helpers'
import { async } from 'q';

const spotifyToken = sessionStorage.spotifyToken
const baseUrl = 'https://api.spotify.com/v1'
const headers = {
  headers: new Headers({
    'Authorization': `Bearer ${spotifyToken}`, 
    'Content-Type': 'application/json'
  })
}

const isOk = res => {
  if (!res.ok) {
    throw Error(res.statusText);
  }
}
const is204 = res => {
  if ( res.status === 204 ) {
    throw Error("is 204");
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

/* 
  * Params can be genre, year, artist, album, label
*/
export const searchSpotify = async( query, type, params=[] ) => {
  
  params = [`type=${type}`, ...Object.keys(params).map(k => `${k}=${params[k]}`) ].join('&')
  const search = new URLSearchParams({ q: query }).toString()

  let res = await fetch(`${baseUrl}/search?${search}&${params}`, {
    headers: new Headers({
      'Authorization': `Bearer ${spotifyToken}`, 
      'Content-Type': 'application/json'
    })
  })
  isOk(res)
  return res.json()
}
/* sort by year
albums.items.map(({artists, name, type, release_date}) => ({name, artists : artists[0].name, type,release_date})).sort((a,b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
*/

export const getMe = async() => {
  try {
    let res = await fetch(baseUrl + '/me', headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.error( error.message )
  }
}


export const checkToken = async(
  spotifyToken=sessionStorage.spotifyToken,
  redirect=false
  ) => {
  try {
    let res = await fetch(baseUrl + '/me', {
      headers: new Headers({
        'Authorization': `Bearer ${spotifyToken}`, 
        'Content-Type': 'application/json'
      })
    })
    isOk(res)
   
    return res.json()
  } catch (error) {
    console.error( error.message )
    if ( redirect ) {
      window.location.replace(LOGIN_URL)
    }
    return error
  }
}

export const followMany = (ids, type) => {

  let queryIds =  ids.splice(0,50)
  if ( ids.length ) {
    followMany(ids)
  }
  follow(queryIds)
}

export const unFollow = async(ids, type) => {
  if ( type !== 'artist' && type !== 'user' ) {
    console.error(type, 'bad type')
    return
  }
  let query = new URLSearchParams({ type }).toString()

  try {
    let res = await fetch(`${baseUrl}/me/following?${query}`, {
      ...headers,
      method: 'DELETE',
      body: JSON.stringify({ids: [].concat(ids)})
    })
    isOk(res)
    return true
  } catch (error) {
    console.error(error.message)
    return false
  }
}
export const follow = async(ids, type) => {
  if ( type !== 'artist' && type !== 'user' ) {
    console.error(type, 'bad type')
    return
  }
  let query = new URLSearchParams({ type }).toString()

  try {
    let res = await fetch(`${baseUrl}/me/following?${query}`, {
      ...headers,
      method: 'PUT',
      body: JSON.stringify({ids: [].concat(ids)})
    })
    isOk(res)
    return true
  } catch (error) {
    console.error(error.message)
    return false
  }
}
export const getFollowingState = async(ids, type) => {
  if ( type !== 'artist' && type !== 'user' ) {
    console.error(type, 'bad type')
    return
  }

  let query = new URLSearchParams({ids: ids.join(), type}).toString()
  // type=${type}&ids
  try {
    let res = await fetch(`${baseUrl}/me/following/contains?${query}`, headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.error(error.message)
  }
}

export const getSavedState = async(ids, type) => {
  if ( type !== 'track') {
    console.error(type, 'bad type')
    return
  }

  let query = new URLSearchParams({ids: [].concat(ids).join(), type}).toString()
  // type=${type}&ids
  try {
    let res = await fetch(`${baseUrl}/me/tracks/contains?${query}`, headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.error(error.message)
  }
}

export const getPlaylistInfo = async(spotifyToken, ids) => {
  try {
    let res = await fetch(`${baseUrl}/tracks/?ids=${ids.join()}`, {
      headers: new Headers({
        'Authorization': `Bearer ${spotifyToken}`, 
        'Content-Type': 'application/json'
      })
    })
    if (!res.ok) {
      throw Error(res.statusText);
    }
    return res.json()
  } catch (error) {
    console.error( error.message )
    return error
  }
}

export const getAlbumById = async (id) => {
  try {
    let res = await fetch(`${baseUrl}/albums/${id}`, headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.error( error.message )
  }
}
export const getAlbums = async (ids) => {
  try {
    let res = await fetch(`${baseUrl}/albums/?ids=${ids.join()}`, headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.error( error.message )
  }
}

export const getAlbumInfo = async(id) => {
  let spotifyToken = sessionStorage.spotifyToken
  try {
    let res= await fetch(`${baseUrl}/albums/${id}`,{
      headers: new Headers({
        'Authorization': `Bearer ${spotifyToken}`, 
        'Content-Type': 'application/json'
      })
    })
    return res.json()
  } catch (error) {
    console.debug(error.message)
    return error
  }
}

export const getMePlaylists = async() => {
  try {
    let res= await fetch(`${baseUrl}/me/playlists`, headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.debug(error.message)
  }
}
export const getPlaylistsTracks = async(listId) => {
  try {
    let res= await fetch(`${baseUrl}/playlists/${listId}/tracks`, headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.debug(error.message)
    return error
  }
}

export const getRecentlyPlayed = async(  ) => {
  const spotifyToken = sessionStorage.spotifyToken
  try {
    let res= await fetch(`${baseUrl}/me/player/recently-played`,{
      headers: new Headers({
        'Authorization': `Bearer ${spotifyToken}`, 
        'Content-Type': 'application/json'
      })
    })
    if ( !res.ok  ) {
      throw Error( ' res not ok ' )
    }
    if ( typeof res !== 'object' ) {
      throw Error( 'nothing is playing' )
    }
    return res.json()
  } catch (error) {
    console.debug(error.message)
    return null
  }
}

export const controls = async (action, body={}) => {
  const spotifyToken = sessionStorage.spotifyToken
  const method = ( action === 'play' || action === 'pause') ? 'PUT' : 'POST'
  try {
    const res = await fetch(`${baseUrl}/me/player/${action}`,{
      headers: new Headers({
        'Authorization': `Bearer ${spotifyToken}`, 
        'Content-Type': 'application/json'
      }),
      method: method,
      body: JSON.stringify({...body})
    })
    if ( !res.ok ) {
      throw res
    }
    return true
  } catch (error) {
    console.log('controls failed', error.message)
    return false
  }
}

export const play = async ( body={}) => {
  try {
    await fetch(`${baseUrl}/me/player/play`,{
      ...headers,
      method: 'PUT',
      body: JSON.stringify({...body})
    })
    return true
  } catch (error) {
    console.debug(error.message)
    return error
  }
}
export const seek = async ( queries={}) => {
  const spotifyToken = sessionStorage.spotifyToken
  let query = new URLSearchParams(queries).toString()
  try {
    await fetch(`${baseUrl}/me/player/seek?${query}`,{
      headers: new Headers({
        'Authorization': `Bearer ${spotifyToken}`, 
        'Content-Type': 'application/json'
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

    let res = await fetch(`${baseUrl}/me/player/currently-playing`,{
      headers: new Headers({
        'Authorization': `Bearer ${spotifyToken}`, 
        'Content-Type': 'application/json'
      })
    })
    isOk(res)
    is204(res)

    const data = res.json()
    return data
 
}

export const getMeSavedTracks = async () => {
  
  try {
    let res = await fetch(`${baseUrl}/me/tracks?limit=50`,headers)
    isOk(res)

    return res.json()
  } catch (err) {
    return []
  }
}
export const getMeSavedAlbums = async () => {
  
  try {
    let res = await fetch(`${baseUrl}/me/albums`,headers)
    isOk(res)

    return res.json()
  } catch (err) {
    return []
  }
}

export const saveTracks = async ids => {
  if ( [].concat(ids).length > 50 ) {
    throw Error('max of 50 tracks can be saved at a time')
  }
  try {
    let res = await fetch(`${baseUrl}/me/tracks`,{
      ...headers,
      method: 'PUT',
      body: JSON.stringify({ids: [].concat(ids)})
      })
    isOk(res)

    return true
  } catch (err) {
    return false
  }
}
export const removeTracks = async ids => {
  if ( ids.length > 50 ) {
    throw Error('max of 50 tracks can be saved at a time')
  }
  try {
    let res = await fetch(`${baseUrl}/me/tracks`,{
      ...headers,
      method: 'DELETE',
      body: JSON.stringify({ids: [].concat(ids)})
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
}

// href: string
// // items: (2) [{…}, {…}]
// limit: number
// next: null
// offset: number
// previous: null
// total: number