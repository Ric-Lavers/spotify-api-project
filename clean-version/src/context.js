import React, { createContext, useState, useEffect} from 'react';
import { currentPlaying } from './api/spotify'

export const CurrentPlayingContext = createContext( [0, () => {console.log('nothing')}] )

const Test = ({ children }) => {
  const [ song, setSong ] = useState(0)
  const [ isFetching, setFetching ] = useState( false )

  useEffect(() => {
    setInterval( setCurrentPlaying, 5000 )
    return ( setCurrentPlaying )
  }, [])


  const setCurrentPlaying = async () => {
    if ( isFetching ) return;
    setFetching(true)
    try {
      let playingNow = await currentPlaying()
      setSong(playingNow)

    } catch (error) {
      console.error(error.message)
    }
    setFetching(false)
  }

  return (
    <CurrentPlayingContext.Provider value={[song, setSong]} >
      <>
        { children }
      </>
    </CurrentPlayingContext.Provider>
  )
}

export default Test
