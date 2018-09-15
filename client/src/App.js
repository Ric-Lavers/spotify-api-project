import React, { Component } from 'react';
import './App.css';

import SpotifyLogin from './components/SpotifyLogin'
import { getPlaylistInfo } from './api/spotify'

const trackKeys = ["name","album","artists","duration_ms","href","id","popularity","track_number","type"]

const blacklist = [
  "available_markets","explicit","external_ids","external_urls","is_local","preview_url","uri","disc_number",
]
class App extends Component {

  state={
    spotifyIds: "",
    loading: true,
    tracks: [],
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    let data = await getPlaylistInfo(localStorage.spotifyToken, this.state.spotifyIds )
    this.setState({ tracks: data.tracks })
    console.log( data )
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
          <div style={i !== tracks.length ? { borderBottom: '1px solid grey' }: {}} >
            {trackKeys.map(key => 
            <p>
              {typeof(track[key]) === 'string' 
                ? `${key}: ${track[key]}`
                : `${key}: object`
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
