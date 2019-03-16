import React, { useContext, useState } from 'react';  

import { GlobalContext } from '../../globalContext'
import CurrentlyPlaying from '../../context'
import { useFlash } from '../../hooks'
import ControlButtons from './ControlButtons'
import Progress from './Progress'
import Details from './Details'
import Search, { SearchResultsContext, types } from './Search'
import SearchResults from './SearchResults'
import { Up, Down } from '../../images/custom-svgs/arrows';


/* 
  * 
*/
const PlayerAPI = () => {
  const [state, dispatch] = useContext(GlobalContext)
  const [ data, setState ] = useState(null)
  const [ touched, flashClass ] = useFlash('touched')
  return  (
    <SearchResultsContext.Provider value={[data, setState]}>
      <div className={`player`} >
        <ActionButton
          Icon={Up}
          label='DEVICES'
          action={() => {
            dispatch({ type: 'visable/toggle-playlist' })
          }}
          className="devices pointer"
        />

        <p className={`header pointer ${ touched }`}
          onClick={() => {
            flashClass()
            dispatch({ type: 'visable/toggle-playlist' })}
          }
        >
          {state.visable.playlist ? 'hide ' : 'show '}PLAYLISTS
        </p>

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


const ActionButton = ({ Icon, label, action, className }) => (
  <div className={`action ${className}`}  onClick={action}>
    <Icon /> {label}
  </div>
)


export default PlayerAPI;
