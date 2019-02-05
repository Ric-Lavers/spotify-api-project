import React, { useState, useEffect } from 'react';
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
    let polling = setInterval( setCurrentPlaying, 3000 )
    return () => clearInterval(polling)
  })


  const setCurrentPlaying = async () => {
    if ( isFetching ) return
    setFetching(true)
    let playingNow = await currentPlaying()
    setSong(playingNow)
    setFetching(false)
  }

  return song ? (
    <div className="audio-controls" style={{position: 'relative', backgroundImage: `url(${song.item.album.images[1].url})`, backgroundSize: 'cover'}}> 
      <div style={{position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'black', opacity: 0.3}} />
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
