const LOGIN_URL = () => {
  let REACT_APP_LOGIN_URL;
  if (process.env.REACT_APP_ENV === 'PROD') {
    REACT_APP_LOGIN_URL= process.env.REACT_APP_LOGIN_URL_PROD
  }else {
    REACT_APP_LOGIN_URL= process.env.REACT_APP_LOGIN_URL_DEV || 'http://localhost:4000/login'
  }
  return REACT_APP_LOGIN_URL
}

class SpotifyHelpers {

  static combineArtists = artists => 
    artists
      .map( ({ name }) => name )
      .join(', ')
  
}

export {
  SpotifyHelpers,
  LOGIN_URL,
}
