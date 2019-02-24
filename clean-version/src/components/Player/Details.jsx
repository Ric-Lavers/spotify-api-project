import React, { useContext, useState, useEffect } from 'react'
import { CurrentPlayingContext, SearchInputsContext } from '../../context'
import { SpotifyHelpers } from '../../helpers'
import { getAlbumById } from '../../api/spotify.js'


const DetailsData = () => {
  const song = useContext(CurrentPlayingContext)
  const [searchInputs, setSearchInputs] = useContext(SearchInputsContext)

  if (!song) { return null }
  const {
    item: {
      name,
      artists,
      album,
    }
  } = song


  const [ albumData, setData ] = useState(album)

  async function handleGetAlbumById(id) {
    //gets the unique fields not avaiable in song.data.item.album
    const {
      copyrights,
      genres,
      label,
      popularity,
      tracks,
    } = await getAlbumById(id)
    setData( {...albumData, copyrights, genres, label, popularity, tracks } )
  }

  useEffect(() => {
    handleGetAlbumById( album.id )
  }, [album.id])

  return <Details getAlbumById={handleGetAlbumById} name={name} artists={artists} album={albumData} setSearchInputs={setSearchInputs} />
}


const Details = React.memo(({ name, artists, album, getAlbumById, setSearchInputs }) => {
  
  
  return ( 
    <>
      <h3>
        <span > {name} </span>
        {" - "}
        <span > {album.name} </span>
      </h3>
      <h4>
        <i>{ SpotifyHelpers.combineArtists(artists) }</i>
        {` ( ${album.release_date} )`}
      </h4>
      <h4 onClick={() => setSearchInputs({ searchLabel:true, searchText: album.label })}
      >{album.label}</h4>
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