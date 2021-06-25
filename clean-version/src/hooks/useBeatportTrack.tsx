/* eslint-disable react/jsx-no-target-blank */
import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import get from 'lodash.get'
import { getBeatportTrackInfo } from '../api/beatport'
import BeatportLogo from '../images/beatport-logo.png'

export const useBeatportTrack = ({ trackName, artistName }) => {
  const [data, setTrackInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkBeatportForTrack = async () => {
      setLoading(true)
      const trackInfo = await getBeatportTrackInfo({
        title: trackName,
        artist: artistName,
      })
      setTrackInfo(trackInfo)
      setLoading(false)
    }
    setTrackInfo(null)
    if (trackName && artistName) checkBeatportForTrack()
  }, [trackName, artistName])

  return { data, loading }
}

export const BeatportLink = ({
  trackName,
  artistName,
  size = 'md',
  loader,
}) => {
  const { data: trackInfo, loading } = useBeatportTrack({
    trackName,
    artistName,
  })

  if (loading) {
    return loader || null
  }

  if (!get(trackInfo, 'trackUrl')) {
    return null
  }

  return (
    <a
      className={`download-logo ${size}`}
      target="_blank"
      href={trackInfo.trackUrl}
    >
      <img src={BeatportLogo} alt="beatport download" />
    </a>
  )
}
