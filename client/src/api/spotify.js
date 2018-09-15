
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