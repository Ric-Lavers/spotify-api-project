import React, { useContext, useState, useEffect } from 'react'
import { CurrentPlayingContext } from '../../context'
import { GlobalContext } from '../../globalContext'
import { SpotifyHelpers } from '../../helpers'
import { getAlbumById } from '../../api/spotify.js'


const DetailsData = () => {
  const song = useContext(CurrentPlayingContext)
  if (!song) { return null }
  const {
    item: {
      name,
      artists,
      album,
      album: {
        id
      },
    }
  } = song
  const [ extraAlbumData, setData ] = useState({})

  async function handleGetAlbumById(id) {
    //gets the unique fields not avaiable in song.data.item.album
    try {
      const {
        genres,
        label,
        popularity,
        tracks,
      } = await getAlbumById(id)
      setData( { genres, label, popularity, tracks } )
    } catch (error) {
      console.error(error.message)
    }
    
    
  }

  useEffect(() => {
    id && handleGetAlbumById(id)
  }, [id])

  return (
    <Details
      getAlbumById={handleGetAlbumById}
      name={name}
      artists={artists}
      album={{...album, ...extraAlbumData}} />
    )
}


const Details = React.memo(({ name, artists, album, getAlbumById }) => {
  const dispatch = useContext(GlobalContext)[1]

  return ( 
    <>
      <h3>{name} - {album.name}</h3>
      <h4>
        <i>{ SpotifyHelpers.combineArtists(artists) }</i>
        {` ( ${album.release_date} )`}
      </h4>
      <h4 className="pointer" 

        onClick={() => dispatch({
          type:'search/set',
          payload: {
            type: 'album',
            searchText: album.label,
            searchLabel: true,
          }}
        )}
      >
        {album.label}
      </h4>
    </>
  )
}, (prevProps, nextProps) => {
  
  if ( prevProps.album.label !== nextProps.album.label ) {
    return false
  }
  if ( prevProps.name === nextProps.name ) {
    return true
  }
  
  return false
})

export default DetailsData