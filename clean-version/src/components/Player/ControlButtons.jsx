import React, { useState, useContext } from 'react';

import { CurrentPlayingContext } from '../../context'
// import { useToggle }from '../../hooks'
import Button from '../common/PlayerButton'
import { controls } from '../../api/spotify'

const ControlButtons = () => {
  // const { is_playing } = useContext(CurrentPlayingContext) || {}

  const [ is_playing, togglePlaying ] = useState( false )

  const handleClick = async action => {
    let isSuccess = await controls( action )
    
    switch ( action ) {
      case 'play':
      case 'pause':
      togglePlaying(!is_playing)
        break
      case 'previous':
      case 'next':
        break;
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

export default ControlButtons