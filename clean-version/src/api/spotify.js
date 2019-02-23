//@flow
import { LOGIN_URL } from  '../helpers'

const spotifyToken = localStorage.spotifyToken
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



export const checkToken = async(
  spotifyToken=localStorage.spotifyToken,
  redirect=false
  ) => {
  try {
    let res = await fetch(baseUrl + '/me', {
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
    if ( redirect ) {
      window.location.replace(LOGIN_URL)
    }
    return error
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

export const getAlbumInfo = async( id) => {
  let spotifyToken = localStorage.spotifyToken
  try {
    let res= await fetch(`${baseUrl}/albums/${id}`,{
      headers: new Headers({
        'Authorization': `Bearer ${spotifyToken}`, 
        'Content-Type': 'application/json'
      })
    })
    return res.json()
  } catch (error) {
    console.log(error.message)
    return error
  }
}

export const getMePlaylists = async() => {
  try {
    let res= await fetch(`${baseUrl}/me/playlists`, headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.log(error.message)
  }
}
export const getPlaylistsTracks = async(listId) => {
  try {
    let res= await fetch(`${baseUrl}/playlists/${listId}/tracks`, headers)
    isOk(res)
    return res.json()
  } catch (error) {
    console.log(error.message)
    return error
  }
}

export const getRecentlyPlayed = async(  ) => {
  const spotifyToken = localStorage.spotifyToken
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
    console.log(error.message)
    return null
  }
}

export const controls = async (action, body={}) => {
  const spotifyToken = localStorage.spotifyToken
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
    console.log(error.message)
    return error
  }
}
export const seek = async ( queries={}) => {
  const spotifyToken = localStorage.spotifyToken
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
    console.log(error.message)
    return error
  }
}

export const currentPlaying = async () => {
  const spotifyToken = localStorage.spotifyToken
  try {
    let res = await fetch(`${baseUrl}/me/player/currently-playing`,{
      headers: new Headers({
        'Authorization': `Bearer ${spotifyToken}`, 
        'Content-Type': 'application/json'
      })
    })
    if ( !res.ok ) {
      throw res
    }
    const data = res.json()
    return data
  } catch (error) {
    console.log(error.message)
    checkToken(undefined, true)
    return null
  }
}


export default {
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
  
}

// href: string
// // items: (2) [{…}, {…}]
// limit: number
// next: null
// offset: number
// previous: null
// total: number