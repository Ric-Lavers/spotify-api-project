import React, { Component } from 'react';
import './App.css';

import SpotifyLogin from './components/SpotifyLogin'
import PopularityMeter from './images/svgs/PopularityMeter'
import { getPlaylistInfo, getAlbumInfo } from './api/spotify'

const trackKeys = ["name", "album", "artists", "label" ,"duration_ms","href","id","popularity","track_number","type"]

const blacklist = [
  "available_markets","explicit","external_ids","external_urls","is_local","preview_url","uri","disc_number",
]
class App extends Component {

  state={
    spotifyIds: [
      '3ZxgKv1s0qWEZOoRuNaxsn',
      '25qeJgZltN9A6knVrr9b4Z',
      '4jCvQTZ0z7RazhHCNxCOue',
    ],
    loading: true,
    tracks: [],
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.spotifyToken
    try {
      let data = await getPlaylistInfo(token, this.state.spotifyIds )
      let { tracks } = data

      let albumPromises =  tracks.map( async(track, i) => {
        let {id} = track.album
        let album =  await getAlbumInfo(token, id)
        Object.assign(tracks[i], {label: album.label})
        console.log( "asseigned label" )
        // return new Promise(resolve => resolve( getAlbumInfo(token, id) ) )
      })
      Promise.all(albumPromises).then(data => {
        console.log( "about to setstate" )
        this.setState({tracks})
        console.log( data )
      })
      
      // console.log( 'albumPromises: ',albumPromises )

      // Promise.all(albumPromises)
      //   .then((albums, i) => {
      //     albums.forEach(album => {
            
      //       console.log( 'label: ', album.label )
      //     })
      //     return tracks
      //     // album[album.findIndex(ii => ii.id === id)]
      //   })
      //   .then(tracks => this.setState({tracks}) )
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
    }
    this.setState({loading: false})
  }

  render() {
    let { tracks } = this.state
    console.log( tracks)
    return (
      <div className="App">
        <h1>Spotify playlists</h1>
        {!this.state.loading &&
          <SpotifyLogin />
          }

        <form 
          onSubmit={this.handleSubmit}
          onChange={({target}) => this.handleChange(target)}
        >
          <textarea
            rows="4" cols="50"
            name="spotifyIds" 
            value={this.state.value} 
          />
          <input type="submit"/>
        </form>
        {tracks.map((track, i) => 
          <div 
          key={track.id}
          style={i !== tracks.length ? { borderBottom: '1px solid grey' }: {}} >
            {trackKeys.map(key => 
            <p>
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
          )
        }
      </div>
    );
  }
}

export default App;
