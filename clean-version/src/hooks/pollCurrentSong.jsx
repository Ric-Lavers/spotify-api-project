import React, { useState, useEffect } from 'react'
import get from 'lodash.get'

import { useAudioControls } from 'components/AudioControls'

export const pulseIds = (elementList = [document.querySelector('.App')]) => {
  elementList.forEach((els) => {
    setTimeout(() => {
      els.classList.add('pulse')
    }, 10)
    els.classList.remove('pulse')
  })
}

export const pollCurrentSong = (initialSong = null) => {
  const { currentSong } = useAudioControls(initialSong)
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
