import React from 'react'

export const SpotifyTrackGrid = ({
  name,
  artists,
  imageUrl,
  currentlyPlaying,
  onClick,
  size = 'sm',
}) => {
  const wh = (() => {
    switch (size) {
      case 'md':
        return '60'
      case 'sm':
      default:
        return '40'
    }
  })()
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
