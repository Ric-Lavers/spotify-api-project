import React, { useState } from 'react';
import posed from 'react-pose';
import classNames from 'classnames';

import { controls, play } from '../api/spotify'
import variables from '../styles/variables';
import './PlayerApi'

const { colors, sizes, spotify } = variables;

const styles = {
  arrowRight:  {
    width: 0,
    height: 0,
    border: `${sizes.md}px solid transparent`,
    borderTopWidth: sizes.md,
    borderBottomWidth: sizes.md,
    borderLeftWidth: sizes.lg,
    borderLeftColor: colors.spotify.green,
  },
  square: {
    width: 0,
    height: 0,
    border: `${sizes.md}px solid ${colors.spotify.white}`,
  }
}

// const Button = posed.div(styles);
const Button = ({ lastTouch, text, action, onClick }) => 
  <div
    className={classNames("icon",
      {[lastTouch[action]?'touched-success':'touched-error']: (typeof lastTouch[action] === 'boolean')}
    )}
    onClick={() => onClick(action)}
  >{ text }</div>
  

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

      <input onChange={findCurrentPosition} onMouseUp={handleSeek} className="icon seek" type="range" min='0' max='100' value={rangeValue} />
  
    </div>
  )
}

// {!!currentSong 
//   &&  <SongDetails details={currentSong.item} />
//   }

export default PlayerAPI;
