import React, { useContext } from 'react'
import { CurrentPlayingContext } from '../../context'
import { SpotifyHelpers } from '../../helpers'

const Details = () => {
  const song = useContext(CurrentPlayingContext)
  if (!song) { return null }
  const {
    item: {
      name,
      artists,
      album,
    }
  } = song

  return ( 
    <>
      <h3>{name} - {album.name}</h3>
      <h4>
        <i>{ SpotifyHelpers.combineArtists(artists) }</i>
        {` ( ${album.release_date} )`}
      </h4>
    </>
  )
}

export default Details