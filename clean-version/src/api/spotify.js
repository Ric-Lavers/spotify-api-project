//@flow
import { LOGIN_URL } from  '../helpers'

const spotifyToken = localStorage.spotifyToken
/* 
  * Params can be genre, year, artist, album, label

*/
export const searchSpotify = async( query, type, params={} ) => {

  const encodedParams = encodeURIComponent( Object.keys(params).map( key =>  `${key}:${params[key]}`).join(' '))
  const search = new URLSearchParams({ q: query+encodedParams }).toString()

  let res = await fetch(`https://api.spotify.com/v1/search?${search}&type=${type}`, {
    headers: new Headers({
      'Authorization': `Bearer ${spotifyToken}`, 
      'Content-Type': 'application/json'
    })
  })
  if (!res.ok) {
    throw Error(res.statusText);
  }
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
    let res = await fetch('https://api.spotify.com/v1/me', {
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
    let res = await fetch(`https://api.spotify.com/v1/tracks/?ids=${ids.join()}`, {
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
/* 
export const getAlbumInfo = (spotifyToken, id) => {
  fetch(`https://api.spotify.com/v1/albums/${id}`,{
    headers: new Headers({
      'Authorization': `Bearer ${spotifyToken}`, 
      'Content-Type': 'application/json'
    })
  })
  .then(res => {
    const json = res.json() 
    console.log( "json", json )
    return json
  })
  .catch(error => {
    console.log(error.message)
    return error
  })
} */

export const getAlbumInfo = async( id) => {
  let spotifyToken = localStorage.spotifyToken
  try {
    let res= await fetch(`https://api.spotify.com/v1/albums/${id}`,{
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

export const getUserPlaylists = async() => {
  const spotifyToken = localStorage.spotifyToken
  try {
    let res= await fetch(`https://api.spotify.com/v1/me/playlists`,{
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
    console.log(error.message)
    return error
  }
}
export const getPlaylistsTracks = async(listId) => {
  const spotifyToken = localStorage.spotifyToken
  try {
    let res= await fetch(`https://api.spotify.com/v1/playlists/${listId}/tracks`,{
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
    console.log(error.message)
    return error
  }
}

export const getRecentlyPlayed = async(  ) => {
  const spotifyToken = localStorage.spotifyToken
  try {
    let res= await fetch(`https://api.spotify.com/v1/me/player/recently-played`,{
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

// export const handleGetPlaylistTrackIds = async(playListId) => {
//   try {
//     let data = await getPlaylistsTracks(playListId)
//     let tracks = data.items.map(item => item.track)
//     let albumPromises = await addInfoToTracks(tracks)
//     Promise.all(albumPromises).then(data => {
//       console.log( "promises resolved" )
//       return( Promise(data) )
//     })
//   } catch(err) {}
// }

// const addInfoToTracks = async (tracks) => {
//   const token = localStorage.spotifyToken
//   let albumPromises =  tracks.map( async(track, i) => {
//     let {id} = track.album
//     let album =  await getAlbumInfo(token, id)
//     Object.assign(tracks[i], {
//       label: album.label,
//       album_name: track.album.name,
//       album_release_date: track.album.release_date,
//       album_md_img: track.album.images.length <= 1 
//         ? track.album.images[1].url
//         : track.album.images[0].url,
//     })
//     return track
//   })
//   return albumPromises
// }

export const controls = async (action, body={}) => {
  const spotifyToken = localStorage.spotifyToken
  const method = ( action === 'play' || action === 'pause') ? 'PUT' : 'POST'
  try {
    const res = await fetch(`https://api.spotify.com/v1/me/player/${action}`,{
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
  const spotifyToken = localStorage.spotifyToken
  try {
    await fetch(`https://api.spotify.com/v1/me/player/play`,{
      headers: new Headers({
        'Authorization': `Bearer ${spotifyToken}`, 
        'Content-Type': 'application/json'
      }),
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
    await fetch(`https://api.spotify.com/v1/me/player/seek?${query}`,{
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
    let res = await fetch(`https://api.spotify.com/v1/me/player/currently-playing`,{
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
  getUserPlaylists,
  getPlaylistsTracks,
  getRecentlyPlayed,
  
  // handleGetPlaylistTrackIds,
}

// href: string
// // items: (2) [{…}, {…}]
// limit: number
// next: null
// offset: number
// previous: null
// total: number