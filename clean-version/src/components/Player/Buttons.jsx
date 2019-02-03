import React from 'react'
import { useToggle }from '../../hooks'
import { Button } from '../common/Button'
import { controls } from '../../api/spotify'

const PlayerButtons = () => {
  let [ isPlay, togglePlay ] = useToggle(false)

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
        text={isPlay ? 'play' : 'pause'}
        action={isPlay ? 'play' : 'pause'}
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