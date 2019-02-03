import React, { useState, useMemo, useContext } from 'react';
import Test, { CurrentPlayingContext } from '../../context'

import ControlButtons from './Buttons'
import Progress from './Progress'


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
  
  let handleSeek, rangeValue
  // let [count, setCount] = useContext( CurrentPlayingContext )
  const findCurrentPosition = (e, props) => console.log( e.target, props )




  return (
    <div className="audio-controls"> 
      <ControlButtons />
      <Progress/>

  
    </div>
  )
}

// {!!currentSong 
//   &&  <SongDetails details={currentSong.item} />
//   }

export default PlayerAPI;
