import React from 'react'
import { useToggle }from '../../hooks'
import Button from '../common/PlayerButton'
import { controls } from '../../api/spotify'

const PlayerButtons = ({ is_playing=true }) => {
  // console.log( {is_playing} )
  let [ _, togglePlay ] = useToggle(is_playing)

  const handleClick = async action => {
    let isSuccess = await controls( action )
    
    switch ( action ) {
      case 'play':
      case 'pause':
        isSuccess && togglePlay()
        break
      // case 'previous':
      // case 'next':
      //   break;
      default:
        break;
    }
    return isSuccess
  }


  return (
    <div className="audio-buttons">
      <Button
        text="prev"
        action="previous"
        onClick={handleClick}
      />
      <Button
        text={is_playing ? 'pause' : 'play'}
        action={is_playing ? 'pause' : 'play'}
        onClick={handleClick}
      />
      <Button
        text="next"
        action="next"
        onClick={handleClick}
      />
    </div>
  )
}

export default PlayerButtons