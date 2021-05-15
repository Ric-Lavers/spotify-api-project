import React, { useContext, useState, useEffect } from 'react'
import { CurrentPlayingContext } from '../../context'
import { GlobalContext } from '../../globalContext'
import { SpotifyHelpers } from '../../helpers'
import {
  getAlbumById,
  saveTracks,
  removeTracks,
  getSavedState,
  controls,
} from '../../api/spotify.js'

import SfChecked from '../common/SfCheck'

const DetailsData = () => {
  const song = useContext(CurrentPlayingContext)
  if (!song || !song.item) {
    return null
  }

  const {
    item: {
      name,
      artists,
      album,
      uri,
      id: trackId,
      album: { id },
    },
  } = song

  useEffect(() => {
    if (trackId === '4Tu8ZM8d 3p7wMDeQMyNg6f') {
      console.log('strawberry')
      controls('next')
    }
  }, [trackId])
  const [extraAlbumData, setData] = useState({})

  async function handleGetAlbumById(id) {
    //gets the unique fields not avaiable in song.data.item.album
    try {
      const { genres, label, popularity, tracks } = await getAlbumById(id)
      const [saved] = await getSavedState(trackId, 'track')

      setData({ genres, label, popularity, tracks, saved })
    } catch (error) {
      console.error(error.message)
    }
  }

  const setSaved = (saved) => setData({ ...extraAlbumData, saved })

  useEffect(() => {
    id && handleGetAlbumById(id)
  }, [id])

  return (
    <Details
      getAlbumById={handleGetAlbumById}
      name={name}
      artists={artists}
      album={{ ...album, ...extraAlbumData }}
      uri={uri}
      id={trackId}
      setSaved={setSaved}
    />
  )
}

const Details = React.memo(
  ({ uri, name, artists, album, id, setSaved }) => {
    const [state, dispatch] = useContext(GlobalContext)
    if (
      album.images.length &&
      state.currentPlaying.image.src !== album.images[0].url
    ) {
      dispatch({
        type: 'currentPlaying/image',
        payload: {
          src: album.images[0].url,
          alt: 'currently playing',
        },
      })
      dispatch({
        type: 'currentPlaying/details',
        payload: { uri, name, artists, album, id },
      })
    }

    return (
      <>
        <h3>
          <span onClick={() => alert(uri)}>
            {' '}
            {name} - {album.name}{' '}
          </span>
          <SfChecked
            checked={album.saved}
            onClick={() => {
              let success = album.saved ? removeTracks(id) : saveTracks(id)
              success.then((b) => b && setSaved(!album.saved))
            }}
          />
        </h3>
        <h4>
          <i>{SpotifyHelpers.combineArtists(artists)}</i>
          {` ( ${album.release_date} )`}
        </h4>
        <h4
          className="pointer"
          onClick={() =>
            dispatch({
              type: 'search/set',
              payload: {
                type: 'artist',
                searchText: album.label.replace(' Recordings', ''),
                searchLabel: true,
              },
            })
          }
        >
          {album.label}
        </h4>
      </>
    )
  },
  (prevProps, nextProps) => {
    if (prevProps.album.label !== nextProps.album.label) {
      return false
    }
    if (prevProps.album.saved !== nextProps.album.saved) {
      return false
    }
    if (prevProps.name === nextProps.name) {
      return true
    }

    return false
  }
)

export default DetailsData
