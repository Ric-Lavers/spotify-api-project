import React, { useContext, useState, useEffect, useMemo } from 'react'
// import  { CurrentPlayingContext } from '../../context'
import { seek } from '../../api/spotify'

const Progress = ({ song }) => {
  let [ rangeValue, setRange ] = useState(50)
 
  const findRange = currentSong => {
    if (!currentSong) return;
    let { progress_ms } = currentSong
    let { duration_ms } = currentSong.item

    return (
      Math.floor( progress_ms/ duration_ms * 100 )
    )
  }

  useEffect(() => {
    setRange ( findRange(song) )
  }, [ song.progress_ms ])
  

  const findPosition = currentSong => {
    if (!currentSong) return;
    let { duration_ms } = currentSong.item
    let { progress_ms } = song

    return (
      Math.floor( duration_ms * (findRange(currentSong) / 100) )
    )
  }
  
  const handleSeek = async (e) => {
    if ( !song ) return;
    let { item: {duration_ms} } = song

    await seek({
      position_ms: Math.floor( e.target.value * 0.01 * duration_ms)
    })
  }

  const handleChange = e => {
    setRange( e.target.value )
  }

  return (
    <input onChange={handleChange}  onMouseUp={handleSeek} className="icon seek" type="range" min='0' max='100' value={rangeValue} />
  )
}

export default Progress