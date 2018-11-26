import React, { useEffect, useState } from 'react'
import { searchDiscogs, labelReleases } from '../api/discogs'
import { searchSpotify, getAlbumInfo } from '../api/spotify'

import { search } from '../mocks/discogsMocks'

const DiscogsSearchResults = ({ query, setTracks }) => {
  const [ labels, setLabels ] = useState([])


  const _searchDiscogs = async query => {
    try {
      const res = await searchDiscogs({ q: query, type: 'label' })
      let { results, pagination } = res
      setLabels( results.slice(0, 10).map( ({title, thumb, id }) => ({ title, thumb, id }) ) )
    } catch (error) {
      console.error(error.message)
    }
  } 

  useEffect( () => {
    if (query && query.length){
      _searchDiscogs(query)
    }
  }, [ query ] )

  const findLabelsReleases = async (labelId, title) => {
    console.log(labelId)

    try {
      // * get all label releases by discogs labelId
      const { releases, pagination } = await labelReleases( labelId )
      // see discongs.js for flow type  id, artist, thumb, title, year
      let albumTitles = releases.map( ({ title, year }) => ({ title, year }) )

      const getAlbums = async (albumTitles) => {
        const albumPromises = albumTitles.map( ({ title, year }) => searchSpotify(title, {type: 'album'}, year) )
    
        let albums = await Promise.all(albumPromises)
        console.log('albums', albums)
        return albums
          .flatMap( i => i.albums.items)
          .filter(i=> i.artists
            .map(j=> j.name)
          )
      }
       
      const getMoreAlbumInfo = async (albumIds) => {
        let albumsInfoPromise =  albumIds.map( albumId => getAlbumInfo(albumId))

        let albumInfo = await Promise.all(albumsInfoPromise)
        let richTracks = albumInfo
          .filter(album => album.label.includes(query))
          .map( album => {
          console.log(album)
          return album.tracks.items.map( track => ({ ...album, ...track }) )
        })
        console.log('richTracks_interal', richTracks)
        return richTracks
      }

      let albums = await getAlbums(albumTitles)

      let richTracks = await getMoreAlbumInfo(albums.map(i => i.id))
      console.log('richTracks',richTracks)
      setTracks(richTracks.flatMap(i => i))
// return
/*
      // spotify can only search by one type at a time * so album is the chosen
      const albumPromises = albumTitles.map( title => searchSpotify(title, {type: 'album'}) )

      Promise.all(albumPromises).then(data => {
        // console.log(data, title)
        let albums = data
          .flatMap( i => i.albums.items)
          .filter(i=> i.artists.map(j=> j.name)
            //.includes(title)
          )
          // console.log({albums})
        return albums
      })
      //
      .then( albums => {
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
console.log(tracks.length && tracks)
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
      */
    } catch (error) {
      console.error(error.message)
    }

  }

  return (
    <div className="DiscogsSearchResults" >
      {labels.length &&
        <h2>Possible Labels</h2>}
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

export default DiscogsSearchResults
