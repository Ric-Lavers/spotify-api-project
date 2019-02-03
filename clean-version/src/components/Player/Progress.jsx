import React, { useContext, useState, useEffect } from 'react'
import  { CurrentPlayingContext } from '../../context'
import { seek } from '../../api/spotify'

const Progress = () => {
  const [ song ] = useContext(CurrentPlayingContext)
  let [ rangeValue, setRange ] = useState(50)
  let { progress_ms } = song

  useEffect(() => {
    findRange(song)
  }, [progress_ms])
  


  const findPosition = currentSong => {
    if (!currentSong) return;
    let { duration_ms } = currentSong.item
    let { progress_ms } = song

    setRange (
      Math.floor( duration_ms * (rangeValue / 100) )
    )
  }
  const findRange = currentSong => {
    if (!currentSong) return;
    let { duration_ms } = currentSong.item
    let { progress_ms } = currentSong

    return (
      Math.floor( progress_ms/ duration_ms * 100 )
    )
  }
  const handleSeek = async () => {
    if ( !song ) return;

    await seek({
      position_ms: findPosition(song)
    })
  }



  return (
    <input /* onChange={findCurrentPosition} */ onMouseUp={handleSeek} className="icon seek" type="range" min='0' max='100' value={rangeValue} />
  )
}

export default Progress