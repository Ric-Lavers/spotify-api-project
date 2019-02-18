import React, { useState, useEffect, useContext  } from 'react'
import { CurrentPlayingContext } from '../../context'
import { seek } from '../../api/spotify'


const ProgressContainer = () => {
  const song = useContext(CurrentPlayingContext)

  if ( !song ) { return null }
  let { progress_ms } = song
  let { duration_ms } = song.item

  return <Progress progress_ms={progress_ms} duration_ms={duration_ms} />
}

const Progress = React.memo(({ progress_ms, duration_ms }) => {
  
  const findRange = currentSong => {
    return (
      Math.floor( progress_ms/ duration_ms * 100 )
    )
  }

  let [ rangeValue, setRange ] = useState(findRange())
  
  const handleSeek = async (e) => {

    await seek({
      position_ms: Math.floor( e.target.value * 0.01 * duration_ms)
    })
    
  }

  const handleChange = ({ target }) => setRange( target.value )
  
  return (
    <input
      onChange={handleChange}
      onMouseUp={handleSeek}
      className="icon seek"
      type="range"
      min='0'
      max='100'
      value={rangeValue}
    />
  )
})

export default ProgressContainer