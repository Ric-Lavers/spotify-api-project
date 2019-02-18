import React, { useState, useEffect, useContext } from 'react'
import Slide from 'react-reveal/Slide'
import Fade from 'react-reveal/Fade';

import { GlobalContext } from '../../globalContext'
import { getMePlaylists } from '../../api/spotify'

const Playlists = () => {

  const [playlists, setPlaylists] = useState([])
  const isHidden = useContext(GlobalContext)[0].playListIsHidden
  
  useEffect(async () => {
    const {items, href} = await getMePlaylists()
    setPlaylists(items)
  }, [])
  console.log( isHidden )

  return (
    <>
      <Fade big when={isHidden}>
      <Slide right when={isHidden}>
        <ul className="results" style={{ borderRadius: '0 14px 14px 0' }} >
          {playlists.map( ({ name, public: isPublic }) => <li>{name}<i>{` - ${isPublic?"public":"private"}`}</i></li> )}
        </ul>
      </Slide>
      </Fade>
    </>
  )
}

export default Playlists
