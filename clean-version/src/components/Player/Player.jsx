import React, { useContext, useState } from 'react';  

import { GlobalContext } from '../../globalContext'
import CurrentlyPlaying from '../../context'
import { useFlash } from '../../hooks'
import ControlButtons from './ControlButtons'
import Progress from './Progress'
import Details from './Details'
import Search, { SearchResultsContext, types } from './Search'
import SearchResults from './SearchResults'

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
  const [state, dispatch] = useContext(GlobalContext)
  const [ data, setState ] = useState(null)
  const [ touched, flashClass ] = useFlash('touched')
  
  return  (
    <SearchResultsContext.Provider value={[data, setState]}>
      <div className={`player`} >
        <p className={`header pointer ${ touched }`}
          onClick={() => {
            flashClass()
            dispatch({ type: 'playlist/hide' })}
          }
        >{state.playListIsHidden ? 'hide ' : 'show '}PLAYLISTS</p>
        <div className="audio-controls" >
          <CurrentlyPlaying>
            <Details />
            <ControlButtons/>
            <Progress />
          </CurrentlyPlaying>
        </div>
        <Search query={state.searchQuery} />
        <SearchResults/>
      </div>
    </SearchResultsContext.Provider>
  )
}

// {!!currentSong 
//   &&  <SongDetails details={currentSong.item} />
//   }

export default PlayerAPI;
