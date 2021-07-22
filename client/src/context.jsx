import React, { createContext } from 'react'
import { currentPlaying } from './api/spotify'
import CurrentPlayingInital from './mocks/currentlyPlaying_empty.json'
import { usePollCurrentSong } from './hooks/pollCurrentSong'

export const CurrentPlayingContext = createContext(CurrentPlayingInital)

const CurrentlyPlaying = ({ children }) => {
  const currentSong = usePollCurrentSong(CurrentPlayingInital)

  return (
    <CurrentPlayingContext.Provider value={currentSong}>
      <>{children} </>
    </CurrentPlayingContext.Provider>
  )
}

export default CurrentlyPlaying
