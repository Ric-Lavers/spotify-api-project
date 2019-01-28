import React, { Component, Fragment } from 'react';
import Select from 'react-select';
// import 'react-select/dist/react-scripts.css';
import './styles/App.scss';
import SpotifyLogin from './components/SpotifyLogin'
import PopularityMeter from './images/svgs/PopularityMeter'
import Loading from './images/svgs/Loading'
import { 
  getPlaylistInfo,
  getAlbumInfo,
  getUserPlaylists,
  getPlaylistsTracks,
  searchSpotify,

  play,
} from './api/spotify'

import SelectContainer from './components/SelectContainer'
import AudioControls from './components/AudioControls'
import DiscogsSearchResults from './components/DiscogsSearchResults'
import SearchSpotify from './components/SearchSpotify'
import { log } from 'handlebars';

export const trackKeys = [
  "name",
  "album_name",
  "album_release_date",
  "artists",
  "label" ,
  "duration_ms",
  "href",
  "popularity",
  "track_number",
  "id",
]

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
    filters: JSON.parse(localStorage.getItem('filters')) || [],
    searchDiscogsQuery: {
      q: "Warp Records",
      type: 'label',
    },
  }
  handleAlbumQuery = query => {
    console.log(query, 'label')

    // this.setState({searchDiscogsQuery: query})
  }
  handleLabelQuery = async (label, type='album') => {
    console.log( label )
    this.setState({searchDiscogsQuery: {q: `label:${label}`, type}})
    let res = await searchSpotify(`label:${label}`, type, {limit: 50})

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
    try {
      let albumPromises =  tracks.map( async(track, i) => {
        let {id} = track.album
        let album =  await getAlbumInfo(id)
        let album_md_img: {}
        if ( track.album.images.length ) {
          album_md_img = track.album.images.length === 2? track.album.images[1].url : track.album.images[0].url;
        }
        Object.assign(tracks[i], {
          label: album.label,
          album_name: track.album.name,
          album_release_date: track.album.release_date,
          album_md_img,
        })
      })
      return albumPromises
    } catch (error) {
      return tracks
    }
    
  }

  handleSubmit = async (event) => {
    event && event.preventDefault();
    const token = localStorage.spotifyToken
    try {
      let data = await getPlaylistInfo(token, this.state.spotifyIds )
      let { tracks } = data
      let albumPromises = this.addInfoToTracks(tracks)
      albumPromises && Promise.all(albumPromises).then(data => {
        console.log( "about to setstate" )
        this.setState({tracks})
      })
    } catch (error) {
      
    }
    
  }
  playSong = async(body) => {
    // console.log("play",JSON.stringify(body, null, 2))
    
    await play(body)
    
  }

  _sortItems = (key, track) => {
    let {tracks, filters} = this.state;
    if ( filters.map(i => i.value).includes( key ) ) {
      return ( <Fragment/> )
    }


    const item = (key, track) => {
      switch (key) {
        case 'artists':
          return <Fragment>
            {`${key}:  `}
            {track[key]
              .map(artist => <a href={artist.external_urls.spotify}>{artist.name}</a>)
              .reduce((prev, curr) => [prev, ', ', curr])
            }
                </Fragment>
        case 'popularity':
          return <div><span>{key}: </span><PopularityMeter popularity={track[key]}/></div>
        case 'href':
          return <a href={track[key].replace('api.spotify.com/v1/tracks','open.spotify.com/track')} target="_blank" >go to spotify</a>
        case 'album_name':
            return (
              <Fragment>
                {key}: 
                <a style={{cursor: 'pointer'}} onClick={() => {
                  this.playSong({context_uri: track.album.uri})
                }} >
                {track[key]} --- play album?
                </a>
              </Fragment>
            )
        case 'label': 
          return(
            <span onClick={() => this.handleLabelQuery(track[key]) } >{key}: {track[key]}</span>
            
          )
              
        
      }
      switch( typeof(track[key]) ){
        case 'string':
          return <Fragment>{key}: {track[key]}</Fragment>
        case 'number':
          return <Fragment>{key}: {track[key]}</Fragment>
        default:
          return <Fragment>{key}: {typeof(track[key])}</Fragment>
      }
    }
    return (
      <p key={key} className={`${key} item`}>
        {item(key, track)}
      </p>
    )

    
  }

  handleChange = ({name, value}) => {
    let newValue = value.replace(/https:\/\/open.spotify.com\/track\//g, '').replace('spotify:track:', "").split('\n')
    
    this.setState({[name]: newValue})
  }

  componentDidMount(){
    const address = window.location.href
    if ( address.includes('access_token=') ) {
      let token=  new URLSearchParams(window.location.search).get('access_token')

      console.log('got token')
      localStorage.spotifyToken = token
      this._getUsersPlaylists()
    }
    this.setState({loading: false})
    this.handleSubmit()
  }

  render() {
    let { tracks, playlistItems, fetching } = this.state

    if (this.state.loading) {
      return <h1>loading...</h1>
    }

    return (
      <div className="App">
      <div className="page home" >

        <div className="header" >
          <Fragment>
          <h1>title</h1>
          
          </Fragment>
        </div>
        <div className="__" >
  {fetching && 
          <Loading/> 
        }
        </div>
        <div className="sidebar" >
          <Fragment>
          <div className="login" >
            <h2>login</h2>
              <SpotifyLogin 
                isLoading={this.state.loading}
              />
          </div>
          <div className="playlists" >
            <h2>playlists</h2>
            <Fragment>
              <ul>
  {playlistItems.map(item => 
                <li className="item"
                  onClick={() =>
                    this.handleGetPlaylistTrackIds(item.id)}
                >
    {item.title}
                </li>                                    )}
              </ul>
            </Fragment>
          </div>

          <div className="keys" >
            <SelectContainer
              
              placeholder={"apply filters"}
              isLoading={this.state.loading}
              className="react-select-container"
              classNamePrefix="react-select"
              isMulti 
              value={this.state.filters}
              onChange={
                (option)=> this.setState( () => ({filters: option})
                , () => {
                  localStorage.setItem(
                    'filters',
                    JSON.stringify(this.state.filters) )})
              }
              options={
                trackKeys.map( key => ({value: key, label: key}) )
              }
            />
            <AudioControls/>
          </div>
          <DiscogsSearchResults 
            query={this.state.searchDiscogsQuery.q}
            type={this.state.searchDiscogsQuery.type}
            setTracks={(tracks) => this.setState({tracks: tracks})}
          />
          </Fragment>
        </div>
       

        <div className="content" >
            <div className="paste" >
              <SearchSpotify/>
              <h2>Paste Song Ids</h2>

        <Fragment>
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
        </Fragment>
            </div>
            <div className="songs" >
              <h3>Song/s</h3>
              <Fragment>
  {tracks.map((track, i) => 
                  <div 
                  key={track.id}
                  className="flex song"
                  >
                    <div className="song__img" >
                      <img src={track.album_md_img} alt='album art'  onClick={() => this.playSong({uris: [track.uri]})} 
                      />
                    </div>
                    <div className="song__info" >
    {trackKeys.map(key =>
                    <Fragment>
      {this._sortItems(key, track)              }      
                    </Fragment>
                  )}  
                    </div>
                  </div>
                  )
                }
              </Fragment>
            </div>
        </div>

      </div>
      </div>
    );
  }
}

export default App;