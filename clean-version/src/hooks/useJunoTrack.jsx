/* eslint-disable react/jsx-no-target-blank */
import React, { useState, useEffect } from 'react'
import get from 'lodash.get'
import { getJunoTrackInfo } from '../api/juno'
import JunoLogo from '../images/juno_download.png'

export const useJunoTrack = ({ trackName, artistName }) => {
  const [trackInfo, setTrackInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkJunoForTrack = async () => {
      setLoading(true)
      const trackInfo = await getJunoTrackInfo({
        track: trackName,
        artist: artistName,
      })
      setTrackInfo(trackInfo)
      setLoading(false)
    }
    setTrackInfo(null)
    if (trackName && artistName) checkJunoForTrack()
  }, [trackName, artistName])

  return { data: trackInfo, loading }
}

export const JunoLink = ({ trackName, artistName, size = 'md', loader }) => {
  const { data: junoTrackInfo, loading } = useJunoTrack({
    trackName,
    artistName,
  })

  if (loading) {
    return loader || null
  }
  if (!get(junoTrackInfo, 'trackUrl')) {
    return null
  }
  return (
    <a
      className={`download-logo ${size}`}
      target="_blank"
      href={junoTrackInfo.trackUrl}
    >
      <img src={JunoLogo} alt="juno download" />
    </a>
  )
}
