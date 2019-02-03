import React, { useState, useEffect, useMemo, useContext } from 'react';
// import Test, { CurrentPlayingContext } from '../../context'

import { currentPlaying } from '../../api/spotify'
import ControlButtons from './Buttons'
import Progress from './Progress'


/* 
  * The Audio controls has the following features;
    *[x] play / pause
    *[x] previous / next 
    * scrub track
    * show track position
    *[x] on successful API button flashes success color
    *[x] on unsuccessful API button flashes fail color
*/
const PlayerAPI = () => {
  const [ song, setSong ] = useState(0)
  const [ isFetching, setFetching ] = useState( false )

  useEffect(() => {
    let polling = setInterval( setCurrentPlaying, 3000 )
    return () => clearInterval(polling)
  },[])


  const setCurrentPlaying = async () => {
    if ( isFetching ) return
    setFetching(true)
    try {
      let playingNow = await currentPlaying()
      setSong(playingNow)

    } catch (error) {
      console.error(error.message)
    }
    setFetching(false)
  }

  return (
    <div className="audio-controls"> 
      <ControlButtons />
      <Progress song={song} />

    </div>
  )
}

// {!!currentSong 
//   &&  <SongDetails details={currentSong.item} />
//   }

export default PlayerAPI;
