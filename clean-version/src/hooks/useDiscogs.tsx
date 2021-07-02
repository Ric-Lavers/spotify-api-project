/* eslint-disable react/jsx-no-target-blank */
import React, { useState, useEffect, useContext } from 'react'
import useSWR from 'swr'
import get from 'lodash.get'
import { getDiscogsTrackInfo } from '../api/discogs'
import DiscogsLogo from '../images/discogs-logo.png'
import YoutubeLogo from '../images/youtube-logo.png'
import { FetchContext } from './useFetchCache'

export const useDiscogs = ({ title, artist }) => {
  const remember = useContext(FetchContext)
  const [data, setTrackInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkDiscogsForTrack = async () => {
      setLoading(true)

      const trackInfo = await remember(`discogs${title}${artist}`, () =>
        getDiscogsTrackInfo({
          track: title,
          artist: artist,
        })
      )

      setTrackInfo(trackInfo)

      setLoading(false)
    }
    setTrackInfo(null)
    if (title && artist) checkDiscogsForTrack()
  }, [title, artist])

  return { data, loading }
}

export const DiscogsLink = ({ title, artist, size = 'md', loader }) => {
  const { data: trackInfo, loading } = useDiscogs({
    title,
    artist,
  })
  if (loading) {
    return loader || null
  }

  if (!get(trackInfo, 'trackUrl')) {
    return null
  }

  const { price, videos = [] } = trackInfo
  videos.length = 1
  return (
    <>
      {videos.map(({ uri }) => (
        <GetTrackLink logoSrc={YoutubeLogo} size={size} trackUrl={uri} />
      ))}
      <GetTrackLink
        price={price}
        logoSrc={DiscogsLogo}
        size={size}
        trackUrl={trackInfo.trackUrl}
      />
    </>
  )
}

interface IGetTrackLink {
  logoSrc: string
  size?: string
  price?: number
  trackUrl: string
}
export const GetTrackLink: React.FC<IGetTrackLink> = ({
  price,
  logoSrc,
  size = 'md',
  trackUrl,
}) => (
  <a className={`download-logo ${size}`} target="_blank" href={trackUrl}>
    {price && <span className="price"> ${price} </span>}
    <img src={logoSrc} alt="discogs download" />
  </a>
)
