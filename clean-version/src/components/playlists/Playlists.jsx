import React, { useState, useEffect, useContext } from 'react'
import Slide from 'react-reveal/Slide'
import Fade from 'react-reveal/Fade';

import { GlobalContext } from '../../globalContext'
import { getMePlaylists, getPlaylistsTracks, play, getMeSavedTracks, getMeSavedAlbums, getHref } from '../../api/spotify'

const PlaylistsItem = ({
  setSelected,
  name,
  id,
  uri,
  selectedId,
  isPublic
}) => (
  <li
    id={id} className="playlist__item"
    onClick={() => setSelected(id === selectedId ?
      {id: null, uri: null} :
      {id, uri}
    )}
  >
      {name}<i>{` - ${isPublic?"public":"private"}`}</i>
  </li>
)

const PlaylistSongs = ({playlistId, context_uri, currentlyPlayingId}) => {
  const [ songs, setSongs ] = useState([])
  const [ nextHref, setHref ] = useState('')
  const [ fetchAll, setFetchingAll ] = useState(false)


  useEffect( () => {
    playlistId ? fetchPlaylistsTracks(playlistId) : setSongs([])
  }, [playlistId])

  const fetchPlaylistsTracks = async id => {
    if ( id ==='savedTracks' ) {
      let { items, next, ...data } = await getMeSavedTracks()
      setSongs(items)
      setHref(next)
    }else {
      let { items, next, ...data } = await getPlaylistsTracks(id)
      setSongs(items)
      setHref(next)
    }
  }

  const addData = async theNextHref => {
    if ( theNextHref ) {
      const {items, next} = await getHref(theNextHref)
      setSongs([...songs, ...items])
      setHref(next)
    }else{
      setHref(null)
    }
  }
  useEffect( () => {
    fetchAll && addData(nextHref)
  }, [nextHref, fetchAll] )

  const uris = songs.map(({track: {uri}} ) => uri );

  return (
    <React.Suspense fallback={<p>...loading</p>}>
    <>
      { songs.map( ({track: { name, id, uri }}, i) => 
        <li onClick={() => context_uri ? play({ context_uri, offset: {position: i} }) : play( { uris: uris, offset:{ position: i }} ) }

          key={id} id={id}
          className={`playlist__song ${currentlyPlayingId === id? 'green' : ''}`}
        >  {name}
        </li>
      )}
      {nextHref &&
      <a onClick={() => setFetchingAll(true)} > Show all </a>
      }
    </>
    </React.Suspense>
  )
}

const Playlists = () => {

  const [playlists, setPlaylists] = useState([])
  const [selected, setSelected] = useState({id: null, uri: null})
  const isHidden = useContext(GlobalContext)[0].visable.playlist
  const currentPlaying = useContext(GlobalContext)[0].currentPlaying.details

  useEffect(() => {
    fetchMePlaylists()
  }, [])

  const fetchMePlaylists = async () => {
    const {items} = await getMePlaylists()
    setPlaylists(items)
  }

  return (
    <>
      <Fade big when={isHidden}>
      <Slide  duration={1000} right when={isHidden}>
        <ul className="playlists" style={isHidden?{}:{display: 'none' } } >
          {(selected.id === null ||  selected.id === 'savedTracks' )&&
          <PlaylistsItem
            setSelected={setSelected}
            selectedId={selected.id}
            name='Your saved songs'
            id='savedTracks'
            isPublic={false}
          />}
          {playlists
            .filter(({id}) => selected.id === null ? true : id === selected.id  )
            .map( ({ id, name, public: isPublic, uri }) => 
              <PlaylistsItem key={id}
                setSelected={setSelected}
                name={name}
                id={id}
                uri={uri}
                selectedId={selected.id}
                isPublic={isPublic}
              />
          )}
          <PlaylistSongs currentlyPlayingId={currentPlaying.id} playlistId={selected.id} context_uri={selected.uri}  />
        </ul>
      </Slide>
      </Fade>
    </>
  )
}

export default Playlists
