//@flow
import React, { useEffect, useState } from 'react'
import { searchDiscogs, labelReleases } from '../api/discogs'
import { searchSpotify, getAlbumInfo } from '../api/spotify'

import { search } from '../mocks/discogsMocks'

const DiscogsSearchResults = ({ query, setTracks, type="label" }) => {
  const [ labels, setLabels ] = useState([])// labelReleasesDiscogs

  useEffect( async () => {
    if (query && query.length){
      try {
        const res = await searchDiscogs({ q: query, type })
        let { results, pagination } = res
      setLabels(
        results
          .slice(0, 10)
          .map( ({title, thumb, id }) => ({ title, thumb, id }) ) )
      } catch (error) {
        console.error(error.message)
      }
    }
  }, [ query ] )

  const findLabelsReleases = async (labelId, title) => {
    console.log(labelId)

    try {
      // find all labels releases by id
      const { releases, pagination } = await labelReleases( labelId )
      // releases Array<labelReleasesDiscogs>
      let albums = 
        releases
          .map( ({ id, artist, thumb, title, year}) => ({ id, artist, thumb, title, year }) )
return
      const albumPromises = albums.map( ({ title }) =>
        searchSpotify(title, 'album') 
      )

      Promise.all(albumPromises).then(data => {
        // console.log("...albumPromises).then(data", data);
        
        albums = data
          .flatMap( i => i.albums.items)
          .filter(i=> i.artists.map(j=> j.name)
          )
        return albums
      }).then( albums => {
        let tracks;

        const labels = albums.map(async (i) => {
          let albumsInfo =  await getAlbumInfo(i.id)
          let {label} = albumsInfo
          if (albumsInfo.track) {
            let {tracks: {items: tracks}} = albumsInfo
          }else {
            tracks = []
          }

          // let fullTracks = tracks.map( t => ({ ...t, label,
          //   album_name: i.album_name,
          //   album_release_date: i.album_release_date,
          //   // album_md_img,
          //   }) )

          return ({...i, label})
        })
        Promise.all(labels).then(fullAlbums => {
          
          const list = fullAlbums
            .filter(album => album.label)
            .filter(album => album.label.includes(query))
          console.log( query, list)
          setTracks(list)
        })
        
      })
    } catch (error) {
      console.error(error.message)
    }

  }

  return (
    <div className="DiscogsSearchResults" >
      <h2>Labels</h2>
      {
        labels
          .filter( ({ thumb }) => !!thumb )
          .map( ({title, thumb, id }) => (
          <div className="row" >
            <img src={thumb} alt={title} />
            <p onClick={() => findLabelsReleases(id, title)} >{title}</p>
          </div>
        ))
      }
    </div>
  )
}

type labelReleasesDiscogs = {
    thumb: string,
    title: string,
    user_data: object,
    master_url: object,
    uri: string,
    cover_image: string,
    resource_url: string,
    master_id: object,
    type: string,
    id: number,
}

export default DiscogsSearchResults
