import React, { useContext, useState, useEffect } from 'react'
import { CurrentPlayingContext } from '../../context'
import { GlobalContext } from '../../globalContext'
import { SpotifyHelpers } from '../../helpers'
import { getAlbumById, currentPlaying } from '../../api/spotify.js'


const DetailsData = () => {

  const song = useContext(CurrentPlayingContext)
  if (!song) { return null }
  const {
    item: {
      name,
      artists,
      album,
      uri,
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
      album={{...album, ...extraAlbumData}}
      uri={uri}
    />
    )
}


const Details = React.memo(({ uri, name, artists, album, getAlbumById }) => {
  const [state, dispatch] = useContext(GlobalContext)
  if ( album.images.length && state.currentPlaying.image.src !== album.images[0].url) {
    dispatch({
      type: 'currentPlaying/image',
      payload: {
        src: album.images[0].url,
        alt: 'currently playing'
      }
    })
  }
  return ( 
    <>
      <h3 onClick={() => alert(uri)} >{name} - {album.name}</h3>
      <h4>
        <i>{ SpotifyHelpers.combineArtists(artists) }</i>
        {` ( ${album.release_date} )`}
      </h4>
      <h4 className="pointer" 

        onClick={() => dispatch({
          type:'search/set',
          payload: {
            type: 'artist',
            searchText: album.label.replace(' Recordings', ''),
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