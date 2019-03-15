import React, { useState, useEffect, useContext } from 'react'
import Slide from 'react-reveal/Slide'
import Fade from 'react-reveal/Fade';

import { GlobalContext } from '../../globalContext'
import { getMePlaylists, getPlaylistsTracks, play } from '../../api/spotify'

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

const PlaylistSongs = ({playlistId, context_uri}) => {
  const [ songs, setSongs ] = useState([])

  useEffect( () => {
    playlistId ? fetchPlaylistsTracks(playlistId) : setSongs([])
  }, [playlistId])

  const fetchPlaylistsTracks = async id => {
    const { items: songs, ...data } = await getPlaylistsTracks(id)
    setSongs(songs)
  }

  return (
    <React.Suspense fallback={<p>...loading</p>}>
      { songs.map( ({track: { name, id, uri }}, i) => 
        <li onClick={(() => play({ context_uri, offset: {position: i} }))}
          key={id} id={id} className="playlist__song"
        >  {name}
        </li>
      )}
    </React.Suspense>
  )
}

const Playlists = () => {

  const [playlists, setPlaylists] = useState([])
  const [selected, setSelected] = useState({id: null, uri: null})
  const isHidden = useContext(GlobalContext)[0].playListIsHidden
  
  useEffect(() => {
    fetchMePlaylists()
  }, [])

  const fetchMePlaylists = async () => {
    const {items, href} = await getMePlaylists()
    setPlaylists(items)
  }

  return (
    <>
      <Fade big when={isHidden}>
      <Slide  duration={1000} right when={isHidden}>
        <ul className="playlists" style={isHidden?{}:{display: 'none' } } >
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
          <PlaylistSongs playlistId={selected.id} context_uri={selected.uri} />
        </ul>
      </Slide>
      </Fade>
    </>
  )
}

export default Playlists
