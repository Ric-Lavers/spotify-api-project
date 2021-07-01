import React, { useState, useEffect } from 'react'
import get from 'lodash.get'

import { currentPlaying } from '../api/spotify'
import { useAudioControls } from 'components/AudioControls'
import CurrentPlayingInital from '../mocks/currentlyPlaying_empty.json'

export const pulseIds = (
  elementList = [
    /* document.querySelector('.App') */
  ]
) => {
  elementList.forEach((els) => {
    setTimeout(() => {
      els.classList.add('pulse')
    }, 10)
    els.classList.remove('pulse')
  })
}

export const usePollCurrentSong = (initialSong = CurrentPlayingInital) => {
  let [currentSong, setSong] = useState(initialSong)
  let [isFetching, setFetching] = useState(false)
  const disablePoll = useState(
    localStorage.getItem('disablePoll') === 'true' || false
  )
  const setCurrentPlaying = async () => {
    if (isFetching || disablePoll) return
    setFetching(true)
    try {
      let playingNow = await currentPlaying()
      setSong(playingNow)
      setFetching(false)
    } catch (error) {}
    setFetching(false)
  }
  useEffect(() => {
    setInterval(setCurrentPlaying, 5000)
    return clearInterval(setCurrentPlaying)
  }, [])

  return currentSong || initialSong
}

export const withCurrentSong = (Component) => () => {
  const currentSong = usePollCurrentSong()
  return <Component currentSong={currentSong} />
}
