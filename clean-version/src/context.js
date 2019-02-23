import React, { createContext, useState, useEffect} from 'react';
import { currentPlaying } from './api/spotify'

export const CurrentPlayingContext = createContext(false) 


const CurrentlyPlaying = ({ children }) => {
  const [ song, setSong ] = useState(false)

  // const setCurrentPlaying = async () => {
  //   let playingNow = await currentPlaying()
  //   setSong(playingNow)
  // }

  // useEffect(() => {
  //   let polling = setInterval( setCurrentPlaying, 3000 )
  //   return () => clearInterval(polling)
  // }, [])

  return (
    <CurrentPlayingContext.Provider value={song} >
      <>
        { children }
      </>
    </CurrentPlayingContext.Provider>
  )
}

export default CurrentlyPlaying
