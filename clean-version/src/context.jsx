import React, { createContext, useState, useEffect } from 'react'
import { currentPlaying } from './api/spotify'
import CurrentPlayingInital from './mocks/currentlyPlaying_empty.json'
import { pollCurrentSong } from './hooks/pollCurrentSong'
import { useSkipTrack } from './hooks/useSkipTrack'

export const CurrentPlayingContext = createContext(CurrentPlayingInital)

const CurrentlyPlaying = ({ children }) => {
  const currentSong = pollCurrentSong(CurrentPlayingInital)
  // useSkipTrack(currentSong)

  return (
    <CurrentPlayingContext.Provider value={currentSong}>
      <>{children} </>
    </CurrentPlayingContext.Provider>
  )
}

export default CurrentlyPlaying
