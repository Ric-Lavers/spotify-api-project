import React from 'react'
import Skeleton from 'react-loading-skeleton'

export const SpotifyTrackGrid = ({
  name,
  artists,
  imageUrl,
  currentlyPlaying,
  onClick,
  size = 'sm',
  loading = false,
}) => {
  const wh = (() => {
    switch (size) {
      case 'md':
        return 60
      case 'sm':
      default:
        return 40
    }
  })()
  if (loading) {
    return (
      <div className="spotify-track">
        <Skeleton className="img" height={wh} width={wh} />

        <div className="track-grid">
          <div className="title">
            <Skeleton width={130} />
          </div>
          <span className="sub-title ">
            <Skeleton width={120} />
          </span>
        </div>
      </div>
    )
  }
  return (
    <div className="spotify-track">
      <img src={imageUrl} height={wh} width={wh} alt="" loading="lazy" />

      <div className="track-grid">
        <div
          className={`${
            currentlyPlaying ? 'green' : ''
          } title ellipsis pointer`}
          onClick={onClick}
        >
          {name}
        </div>
        <span className="sub-title ellipsis">{artists}</span>
      </div>
    </div>
  )
}
