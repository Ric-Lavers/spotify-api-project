import React, { useState, useEffect } from 'react';
// import Test, { CurrentPlayingContext } from '../../context'

import { currentPlaying } from '../../api/spotify'
import ControlButtons from './Buttons'
import Progress from './Progress'
import Details from './Details'
import LoadingSvg from '../../images/custom-svgs/Loading'
import Search from './Search'

/* 
  * The Audio controls has the following features;
    *[x] play / pause
    *[x] previous / next 
    * scrub track
    * show track position
    *[x] on successful API button flashes success color
    *[x] on unsuccessful API button flashes fail color
*/
const PlayerAPI = ({ visable }) => {
  const [ song, setSong ] = useState(false)
  const [ isFetching, setFetching ] = useState( false )

  useEffect(() => {
    if (visable) {
      let polling = setInterval( setCurrentPlaying, 3000 )
      return () => clearInterval(polling)
    }
  }, [visable])


  const setCurrentPlaying = async () => {
    if ( isFetching ) return
    setFetching(true)
    let playingNow = await currentPlaying()
    setSong(playingNow)
    setFetching(false)
  }

  return  (
    <div className="player"> 
      <div className="audio-controls" >
      {song ?
        <>
          <Details song={song} />
          <ControlButtons is_playing={song.is_playing} />
          <Progress song={song} />
        </>:
        <LoadingSvg/>}
      </div>
      <Search />
    </div>
  )
}

// {!!currentSong 
//   &&  <SongDetails details={currentSong.item} />
//   }

export default PlayerAPI;
