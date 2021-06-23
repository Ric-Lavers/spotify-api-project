import { useState, useEffect } from 'react'
import { getJunoTrackInfo } from '../api/juno'

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
