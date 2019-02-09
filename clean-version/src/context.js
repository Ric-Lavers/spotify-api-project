import React, { createContext, useState, useEffect} from 'react';
import { currentPlaying } from './api/spotify'

export const CurrentPlayingContext = createContext(false) 


const CurrentlyPlaying = ({ children }) => {
  const [ song, setSong ] = useState(false)
  const [ isFetching, setFetching ] = useState( false )

  useEffect(() => {
    let polling = setInterval( setCurrentPlaying, 3000 )
    return () => clearInterval(polling)
  })


  const setCurrentPlaying = async () => {
    if ( isFetching ) return
    setFetching(true)
    let playingNow = await currentPlaying()
    setSong(playingNow)
    setFetching(false)
  }

  return (
    <CurrentPlayingContext.Provider value={song} >
      <>
        { children  }
      </>
    </CurrentPlayingContext.Provider>
  )
}

export default CurrentlyPlaying
