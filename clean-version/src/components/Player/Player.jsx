import React, { useState, useEffect, useMemo, useContext } from 'react';
// import Test, { CurrentPlayingContext } from '../../context'

import { currentPlaying } from '../../api/spotify'
import ControlButtons from './Buttons'
import Progress from './Progress'
import Details from './Details'


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
  const [ song, setSong ] = useState(null)
  const [ isFetching, setFetching ] = useState( false )

  useEffect(() => {
    // setCurrentPlaying()
    let polling = setInterval( setCurrentPlaying, 3000 )
    return () => clearInterval(polling)
  })


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

  return song ?(
    <div className="audio-controls"> 
      <Details song={song} />
      <ControlButtons is_playing={song.is_playing} />
      <Progress song={song} />

    </div>
  ): null
}

// {!!currentSong 
//   &&  <SongDetails details={currentSong.item} />
//   }

export default PlayerAPI;
