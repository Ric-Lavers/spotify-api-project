let LOGIN_URL;
if (process.env.REACT_APP_ENV === 'PROD') {
  LOGIN_URL= process.env.REACT_APP_LOGIN_URL_PROD || 'http://aeons-spotify.now.sh/login'
} else {
  LOGIN_URL= process.env.REACT_APP_LOGIN_URL_DEV || 'http://localhost:4000/login'
}

class SpotifyHelpers {

  static combineArtists = artists => 
    artists
      .map( ({ name }) => name )
      .join(', ')

  static scrollIntoView = elementId => 
    document.getElementById(elementId).scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  
}

export {
  SpotifyHelpers,
  LOGIN_URL,
}
