let LOGIN_URL;
if (process.env.REACT_APP_ENV === 'PROD') {
  LOGIN_URL='http://aeons-spotify.now.sh/login'
} else {
  LOGIN_URL= process.env.REACT_APP_LOGIN_URL_DEV || 'http://localhost:4000/login'
}

class SpotifyHelpers {

  static combineArtists = artists => 
    artists
      .map( ({ name }) => name )
      .join(', ')

}

class Utils {
  static scrollIntoView = elementId => 
  document.getElementById(elementId).scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })

static scrollToTop = () => 
  window.scroll({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
}

export {
  SpotifyHelpers,
  Utils,
  LOGIN_URL,
}
