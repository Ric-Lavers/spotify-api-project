
class SpotifyHelpers {

  static combineArtists = artists => 
    artists
      .map( ({ name }) => name )
      .join(', ')
  
}

export default SpotifyHelpers