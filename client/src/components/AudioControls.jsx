import React, { useState, useEffect } from 'react'

import { controls, currentPlaying, seek} from '../api/spotify'

const AudioControls = () => {
  let [audioIs, setAudio] = useState('')
  let [ currentSong, setSong ] = useState({})
  let [ isFetching, setFetching ] = useState(false)
  let [ rangeValue, setRange ] = useState(50)


  const handleClick = async (e, action) => {
    e.preventDefault()
    let body = {}
    
    const success = await controls(action, body )

    if ( success ) {
      setAudio(action, body)

      switch (action) {
        case 'next':

          break;
      
        default:
          
          break;
      }
    }
  }

  const checkActive = button => {
    return audioIs === button ? "touched" : ""; 
  }

  const findCurrentPosition = async ({target}) => {
    setRange(target.value)
    if ( isFetching ) return
    setFetching(true)

    let playingNow = await currentPlaying()
    setSong(playingNow)

    setFetching(false)
  }

  const handleSeek = async () => {
    let duration_ms = currentSong.item.duration_ms
    let progress_ms = currentSong.progress_ms

    let position_ms = Math.floor(duration_ms * (rangeValue / 100) )
    
    await seek({
      position_ms: position_ms 
    })
  }




  return (
    <div> 
      <div className="audio-controls">
        <a className={`icon previous ${checkActive('previous')}`}
          onClick={(e) => handleClick(e, 'previous')}
          href="">
            previous
        </a>
        <a className={`icon play ${checkActive('play')}`}
          onClick={(e) => handleClick(e, 'play')} href="">play</a>

        <a className={`icon next ${checkActive('next')}`}
          onClick={(e) => handleClick(e, 'next')} href="">next</a>
      </div>
      <input onChange={findCurrentPosition} onMouseUp={handleSeek} className="icon seek" type="range" min='0' max='100' value={rangeValue} />
    </div>
  )
}

export default AudioControls