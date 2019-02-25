import React, { createContext, useState, useEffect} from 'react';
import { currentPlaying } from './api/spotify'
import CurrentPlayingInital from './mocks/currentlyPlaying_empty.json'


export const CurrentPlayingContext = createContext(CurrentPlayingInital) 


const CurrentlyPlaying = ({ children }) => {
  const [ song, setSong ] = useState(CurrentPlayingInital)

  const setCurrentPlaying = async () => {
    let playingNow = await currentPlaying()
    // console.log(playingNow)
    setSong(playingNow)
  }

  useEffect(() => {
    let polling = setInterval( setCurrentPlaying, 3000 )
    return () => clearInterval(polling)
  }, [])

  return (
    <CurrentPlayingContext.Provider value={song} >
      <>
        { children }
      </>
    </CurrentPlayingContext.Provider>
  )
}

export default CurrentlyPlaying
