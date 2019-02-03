import React, { useState, useMemo } from 'react';

import { controls } from '../api/spotify'
import Button, {Button as ButtonPres} from './common/Button'


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
  let [ isPlay, setPlay ] = useState( false )
  let [ lastTouch, setTouch  ] = useState( { init: null } )

  let handleSeek, rangeValue

  const setLastTouch = (action, isSuccess) => {
    console.log(action)
    setTouch({ [action]: isSuccess})
    setTimeout( () => {
      setTouch({ init: null })
    }, 1000  )
  }


  const handleClick = async action => {
    let isSuccess = await controls( action )
    
    switch ( action ) {
      case 'play':
      case 'pause':
        isSuccess && setPlay( !isPlay )
      case 'previous':
      case 'next':
        setLastTouch( action, isSuccess )
        break;
      default:
        break;
    }
  }



  const findCurrentPosition = (e, props) => console.log( e.target, props )

  return (
    <div> 
      <div className="audio-controls">
        <Button
          text="prev"
          action="previous"
          lastTouch={lastTouch}
          onClick={handleClick}
        />
        <Button
          text={isPlay ? 'play' : 'pause'}
          action={isPlay ? 'play' : 'pause'}
          lastTouch={lastTouch}
          onClick={handleClick}
        />
        <Button
          text="next"
          action="next"
          lastTouch={lastTouch}
          onClick={handleClick}
        />
      </div>
      <div className="audio-controls">
        <ButtonPres
          text="prev"
          action="previous"
          lastTouch={lastTouch}
          onClick={handleClick}
        />
        <ButtonPres
          text={isPlay ? 'play' : 'pause'}
          action={isPlay ? 'play' : 'pause'}
          lastTouch={lastTouch}
          onClick={handleClick}
        />
        <ButtonPres
          text="next"
          action="next"
          lastTouch={lastTouch}
          onClick={handleClick}
        />
      </div>

      <input onChange={findCurrentPosition} onMouseUp={handleSeek} className="icon seek" type="range" min='0' max='100' value={rangeValue} />
  
    </div>
  )
}

// {!!currentSong 
//   &&  <SongDetails details={currentSong.item} />
//   }

export default PlayerAPI;
