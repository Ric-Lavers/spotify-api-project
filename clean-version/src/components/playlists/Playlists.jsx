import React, { useState, useEffect, useContext } from 'react'
import Slide from 'react-reveal/Slide'
import Fade from 'react-reveal/Fade';

import { GlobalContext } from '../../globalContext'
import { getMePlaylists } from '../../api/spotify'

const Playlists = () => {

  const [playlists, setPlaylists] = useState([])
  const [selected, setSelected] = useState(null)
  const isHidden = useContext(GlobalContext)[0].playListIsHidden
  
  useEffect(async () => {
    const {items, href} = await getMePlaylists()
    setPlaylists(items)
  }, [])

  return (
    <>
      <Fade big when={isHidden}>
      <Slide right when={isHidden}>
        <ul className="results" style={{ borderRadius: '0 14px 14px 0', ...isHidden?{}:{display: 'none' } }} >
          {playlists
            .filter(({id}) => selected === null ? true : id === selected  )
            .map( ({ id, name, public: isPublic }) => 
            <li onClick={() => setSelected(id === selected ? null : id)}
            key={id}
            id={id}
            >
              {name}<i>{` - ${isPublic?"public":"private"}`}</i>
            </li>
          )}
        </ul>
      </Slide>
      </Fade>
    </>
  )
}

export default Playlists
