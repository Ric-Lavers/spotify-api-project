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

  useEffect(() => {
    setRange(findRange())
  }, [progress_ms, duration_ms])
  
  const handleSeek = ({ target: { value } }) => {
    seek({
      position_ms: Math.floor( value * 0.01 * duration_ms)
    })
  }

  return (
    <input
      onChange={({ target: { value } }) => setRange( value )}
      onMouseUp={handleSeek}
      className="icon seek"
      type="range"
      min='0'
      max='100'
      value={rangeValue.toString()}
    />
  )
})

export default ProgressContainer