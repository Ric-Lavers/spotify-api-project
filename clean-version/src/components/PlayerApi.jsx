import React, { useState } from 'react';
import posed from 'react-pose';

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

const Button = posed.div(styles);


/* 
  * The Audio controls has the following features;
    * play / pause
    * previous / next 
    * scrub track
    * show track position
    * on successful API button flashes success color
    * on unsuccessful API button flashes fail color
*/
const PlayerAPI = () => {
  let [ isPlay, setPlay ] = useState( false )

  let handleSeek, rangeValue


  const handleClick = (e, props) => {
    console.log( e.target, props )
    setPlay( !isPlay )
  }
  const findCurrentPosition = (e, props) => console.log( e.target, props )

  return (
    <div> 
      <div className="audio-controls">
        <Button 
          pose={ isPlay ? 'arrowRight' : 'square' }
          className="icon"
          onClick={ handleClick } 
        >{isPlay ? 'arrowRight' : 'square'}</Button>

      </div>

      <input onChange={findCurrentPosition} onMouseUp={handleSeek} className="icon seek" type="range" min='0' max='100' value={rangeValue} />
  
    </div>
  )
}

// <a
//   className={`icon previous`}
//   onClick={(e) => handleClick(e, 'previous')}
//   href="">
//     previous
// </a>
// <a className={`icon next`}
//           onClick={(e) => handleClick(e, 'next')} href="">next</a>

// {!!currentSong 
//   &&  <SongDetails details={currentSong.item} />
//   }

export default PlayerAPI;
