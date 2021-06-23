/* eslint-disable react/jsx-no-target-blank */
import React, { useState, useEffect } from 'react'
import get from 'lodash.get'
import { getJunoTrackInfo } from '../api/juno'
import JunoLogo from '../images/juno_download.png'
export const useJunoTrack = ({ trackName, artistName }) => {
  const [trackInfo, setTrackInfo] = useState(null)

  useEffect(() => {
    const checkJunoForTrack = async () => {
      const trackInfo = await getJunoTrackInfo({
        track: trackName,
        artist: artistName,
      })
      setTrackInfo(trackInfo)
    }
    setTrackInfo(null)
    if (trackName && artistName) checkJunoForTrack()
  }, [trackName, artistName])

  return trackInfo
}

export const JunoLink = ({ trackName, artistName }) => {
  const junoTrackInfo = useJunoTrack({ trackName, artistName })
  if (!get(junoTrackInfo, 'trackUrl')) {
    return null
  }
  return (
    <a className="download-logo" target="_blank" href={junoTrackInfo.trackUrl}>
      <img src={JunoLogo} alt="juno download" />
    </a>
  )
}
