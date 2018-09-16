import React, { Component } from 'react';
import './App.css';

import SpotifyLogin from './components/SpotifyLogin'
import PopularityMeter from './images/svgs/PopularityMeter'
import Loading from './images/svgs/Loading'
import { 
  getPlaylistInfo,
  getAlbumInfo,
  getUserPlaylists,
  getPlaylistsTracks,
} from './api/spotify'

const trackKeys = ["name", "album_name", "album_release_date", "artists", "label" ,"duration_ms","href","popularity","track_number","id"]

/* const blacklist = [
  "type","available_markets","explicit","external_ids","external_urls","is_local","preview_url","uri","disc_number",
] */

const styles = {
  playlistItems: {
    cursor: 'pointer',
  }
}
class App extends Component {

  state={
    loading: true,
    fetching: false,
    spotifyIds: [
      '3ZxgKv1s0qWEZOoRuNaxsn',
      '25qeJgZltN9A6knVrr9b4Z',
      '4jCvQTZ0z7RazhHCNxCOue',
    ],
    tracks: [],
    playlistItems: [],
  }

  _getUsersPlaylists = async() => {
    try {
      const playlists = await getUserPlaylists()
      console.log( playlists )
      this.setState({ 
        playlistItems: playlists.items.map(pl => ({
          title: pl.name,
          id: pl.id,
        }))
      })
    } catch (error) {
      console.log( error.message )
    }
  }


  handleGetPlaylistTrackIds = async(playListId) => {
    this.setState({fetching: true})
    try {
      let data = await getPlaylistsTracks(playListId)
      let tracks = data.items.map(item => item.track)
      let albumPromises = this.addInfoToTracks(tracks)
      Promise.all(albumPromises).then(data => {
        console.log( "about to setstate" )
        this.setState({tracks})
      })
    } catch(err) {}
    setTimeout(() => this.setState({fetching: false}), 1500)
  }

  addInfoToTracks = (tracks) => {
    const token = localStorage.spotifyToken
    let albumPromises =  tracks.map( async(track, i) => {
      let {id} = track.album
      let album =  await getAlbumInfo(token, id)
      Object.assign(tracks[i], {
        label: album.label,
        album_name: track.album.name,
        album_release_date: track.album.release_date,
        album_md_img: track.album.images.length <= 1 
          ? track.album.images[1].url
          : track.album.images[0].url,
      })
    })
    return albumPromises
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.spotifyToken
    try {
      let data = await getPlaylistInfo(token, this.state.spotifyIds )
      let { tracks } = data
      let albumPromises = this.addInfoToTracks(tracks)
      Promise.all(albumPromises).then(data => {
        console.log( "about to setstate" )
        this.setState({tracks})
      })
    } catch (error) {
      
    }
    
  }



  handleChange = ({name, value}) => {
    let newValue = value.replace(/https:\/\/open.spotify.com\/track\//g, '').split('\n')
    this.setState({[name]: newValue})
  }

  componentDidMount(){
    const address = window.location.href
    console.log( address )
    if ( address.includes('access_token=') ) {
      const token = address.replace('http://localhost:3000/?access_token=', '')
      console.log('got token')
      localStorage.spotifyToken = token
      this._getUsersPlaylists()
    }
    this.setState({loading: false})
  }

  render() {
    let { tracks, playlistItems, fetching } = this.state
    console.log('playlistItems', playlistItems )
    console.log( "tracks: ", tracks )

    if (this.state.loading) {
      return <h1>loading...</h1>
    }

    return (
      <div className="App">
        <h1>Spotify playlists</h1>
        {!this.state.loading &&
          <SpotifyLogin />
          }
        <div style={{textAlign: "left"}} >
          <h2>Playlists</h2>
          <ul>
            {playlistItems.map(item => 
              <li
                style={styles.playlistItems}
                onClick={() => this.handleGetPlaylistTrackIds(item.id)}
              >{item.title}</li> )}
          </ul>
        </div>
        {fetching && <Loading/>}
        <form 
          onSubmit={this.handleSubmit}
          onChange={({target}) => this.handleChange(target)}
          >
          <label> copy paste from spotify playlist or add spotify ids <br/>
            <textarea
              rows="4" cols="50"
              name="spotifyIds" 
              value={this.state.value} 
            />
          </label><br/>
          <input type="submit"/>
        </form>
        {tracks.map((track, i) => 
          <div 
          key={track.id}
          style={i !== tracks.length ? { borderBottom: '1px solid grey' }: {}}
          className="flex"
          >
            <img src={track.album_md_img} alt={track.album.name} 
              style={{width: 150, height: 150, borderRadius: 25}}
            />
            <div style={{display: 'block', marginLeft: 32}}>
              {trackKeys.map(key =>
              <p key={key}>
                {
                  
                  
                  key === 'artists'
                    ? `${key}: ${track[key].map(artist => artist.name).join(',')}`
                    : key === "popularity"
                      ? <span>{key}: <PopularityMeter popularity={track[key]}/></span>
                      : typeof(track[key]) === 'string' || typeof(track[key]) === 'number' 
                        ? `${key}: ${track[key]}`
                        : `${key}: ${typeof(track[key])}`
                }
              </p>
              )} 
            </div>
          </div>
          )
        }
      </div>
    );
  }
}

export default App;
