
export const checkToken = async(spotifyToken) => {
  try {
    let res = await fetch('https://api.spotify.com/v1/me', {
      headers: new Headers({
        'Authorization': `Bearer ${spotifyToken}`, 
        'Content-Type': 'application/json'
      })
    })
    return res.json()
  } catch (error) {
    console.log( error.message )
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
    return res.json()
  } catch (error) {
    console.log( error.message )
    return error
  }
}
 export const getUsersTopArtists = async(spotifyToken, params) => {
   try {
     let res = await fetch('https://api.spotify.com/v1/me/top/artists', {
      headers: new Headers({
        'Authorization': `Bearer ${spotifyToken}`, 
        'Content-Type': 'application/json'
      })
    })
    return res.json()
   } catch (error) {
    console.log( error.message )
    return error
   }
 }
 export const getUsersTopAlbums = async(spotifyToken, params) => {
   try {
     let res = await fetch('https://api.spotify.com/v1/me/top/albums', {
      headers: new Headers({
        'Authorization': `Bearer ${spotifyToken}`, 
        'Content-Type': 'application/json'
      })
    })
    return res.json()
   } catch (error) {
    console.log( error.message )
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

export const getAlbumInfo = async(spotifyToken, id) => {
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
    return res.json()
  } catch (error) {
    console.log(error.message)
    return error
  }
}
export const getPlaylistsTracks = async(playlistId) => {
  const spotifyToken = localStorage.spotifyToken
  try {
    let res= await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`,{
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