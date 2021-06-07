import React, { useState, useEffect } from 'react'

import { controls, currentPlaying, seek } from '../api/spotify'
import { combineArtists } from '../helpers'
import { pulseIds } from 'hooks/pollCurrentSong'

export const useAudioControls = (initialSong = null) => {
  let [audioIs, setAudio] = useState('')
  let [currentSong, setSong] = useState(initialSong)
  let [isFetching, setFetching] = useState(false)
  let [rangeValue, setRange] = useState(50)
  let [playOrPause, setPorP] = useState('pause')

  useEffect(async () => {
    setInterval(setCurrentPlaying, 5000)
    return clearInterval(setCurrentPlaying)
  }, [])

  const handleClick = async (e, action) => {
    e.preventDefault()
    let body = {}

    const success = await controls(action, body)

    if (success) {
      setAudio(action, body)

      switch (action) {
        case 'next':
          break
        case 'play':
        case 'pause':
          setPorP(action === 'pause' ? 'play' : 'pause')
          break

        default:
          break
      }
    }
  }

  const checkActive = (button) => {
    return audioIs === button ? 'touched' : ''
  }

  const findCurrentPosition = async ({ target }) => {
    setRange(target.value)
    if (isFetching) return
    setFetching(true)

    let playingNow = await currentPlaying()
    playingNow ? setSong(playingNow) : setSong(null)

    setFetching(false)
  }

  const handleSeek = async () => {
    if (!currentSong) return

    // setRange(progress_ms/ duration_ms * 100)
    let position = findPosition(currentSong)
    await seek({
      position_ms: position,
    })
  }

  const findPosition = (currentSong) => {
    let { duration_ms } = currentSong.item

    return Math.floor(duration_ms * (rangeValue / 100))
  }

  const findRange = (currentSong) => {
    let { duration_ms } = currentSong.item
    let { progress_ms } = currentSong

    return Math.floor((progress_ms / duration_ms) * 100)
  }

  const setCurrentPlaying = async () => {
    if (isFetching) return
    setFetching(true)
    try {
      let playingNow = await currentPlaying()
      pulseIds()
      setSong(playingNow)
      setRange(findRange(playingNow))
    } catch (error) {}
    setFetching(false)
  }

  return {
    playOrPause,
    handleClick,
    checkActive,
    findCurrentPosition,
    handleSeek,
    rangeValue,
    currentSong,
    setCurrentPlaying,
  }
}

/**
 * ?i dont think is actually used anywhere
 * the hook kinda is though
 */
const AudioControls = () => {
  const {
    playOrPause,
    handleClick,
    checkActive,
    findCurrentPosition,
    handleSeek,
    rangeValue,
    currentSong,
  } = useAudioControls()

  return (
    <div>
      <div className="audio-controls">
        <a
          className={`icon previous ${checkActive('previous')}`}
          onClick={(e) => handleClick(e, 'previous')}
          href=""
        >
          previous
        </a>
        <a
          className={`icon play ${checkActive('play')}`}
          onClick={(e) => handleClick(e, playOrPause)}
          href=""
        >
          {playOrPause}
        </a>

        <a
          className={`icon next ${checkActive('next')}`}
          onClick={(e) => handleClick(e, 'next')}
          href=""
        >
          NEXT
        </a>
      </div>

      <input
        onChange={findCurrentPosition}
        onMouseUp={handleSeek}
        className="icon seek"
        type="range"
        min="0"
        max="100"
        value={rangeValue}
      />
      {!!currentSong && <SongDetails details={currentSong.item} />}
    </div>
  )
}

const SongDetails = ({ details }) => {
  // console.log('SongDetails', details)
  return details ? (
    <>
      <h3>
        {details.name} - {details.album.name}
      </h3>
      <h4>
        <i>{combineArtists(details.artists)}</i>
        {` ( ${details.album.release_date} )`}
      </h4>
    </>
  ) : (
    <p>...</p>
  )
}

export default AudioControls
