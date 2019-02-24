import React, { useContext } from 'react';

import { SearchInputsContext } from '../../context'
import ControlButtons from './ControlButtons'
import Progress from './Progress'
import Details from './Details'
import Search from './Search'
import CurrentlyPlaying from '../../context'


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
  const [ searchInputs ] = useContext(SearchInputsContext)

  return  (
    <div className="player" >
      <div className="audio-controls" >
        <CurrentlyPlaying>
          <Details />
          <ControlButtons/>
          <Progress />
        </CurrentlyPlaying>
      </div>
      <Search searchInputs={searchInputs} />
    </div>
  )
}

// {!!currentSong 
//   &&  <SongDetails details={currentSong.item} />
//   }

export default PlayerAPI;
