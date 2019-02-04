import React from 'react'

import { SpotifyHelpers } from '../../helpers'

const Details = ({ song }) => {
  if ( !song ){ return null }

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