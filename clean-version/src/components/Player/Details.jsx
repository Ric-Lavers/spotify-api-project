import React, { useContext } from 'react'
import { CurrentPlayingContext } from '../../context'
import { SpotifyHelpers } from '../../helpers'

const DetailsData = () => {
  const song = useContext(CurrentPlayingContext)
  if (!song) { return null }
  const {
    item: {
      name,
      artists,
      album,
    }
  } = song
  return <Details name={name} artists={artists} album={album} />
}


const Details = React.memo(({ name, artists, album }) => {
  
  return ( 
    <>
      <h3>{name} - {album.name}</h3>
      { console.count( 'details' ) }
      <h4>
        <i>{ SpotifyHelpers.combineArtists(artists) }</i>
        {` ( ${album.release_date} )`}
      </h4>
    </>
  )
}, (prevProps, nextProps) => {
  if ( prevProps.name === nextProps.name ) {
    return true
  }
  return false
})

export default DetailsData