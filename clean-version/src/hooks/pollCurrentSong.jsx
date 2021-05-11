import React, { useState, useEffect } from 'react'
import get from 'lodash.get'

import { useAudioControls } from 'components/AudioControls'

export const pollCurrentSong = () => {
  const { currentSong } = useAudioControls()
  const currentTrackId = get(currentSong, 'item.id')
  const [song, setSong] = useState(currentSong)
  useEffect(() => {
    if (currentTrackId) setSong(currentSong)
  }, [currentTrackId])

  return song
}

export const withCurrentSong = (Component) => () => {
  const currentSong = pollCurrentSong()
  return <Component currentSong={currentSong} />
}
