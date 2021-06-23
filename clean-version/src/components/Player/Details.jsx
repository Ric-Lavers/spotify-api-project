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
} from '../../api/spotify'
import { getJunoTrackInfo } from '../../api/juno'
import JunoLogo from '../../images/juno_download.png'

import SfChecked from '../common/SfCheck'
const useJunoTrack = ({ trackName, artistName }) => {
  const [trackInfo, setTrackInfo] = useState(null)

  const checkJunoForTrack = async () => {
    const trackInfo = await getJunoTrackInfo({
      track: trackName,
      artist: artistName,
    })
    setTrackInfo(trackInfo)
  }
  useEffect(() => {
    if (trackName && artistName) checkJunoForTrack()
  }, [trackName, artistName])

  return trackInfo
}

const DetailsData = () => {
  const song = useContext(CurrentPlayingContext)

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

  const junoTrackInfo = useJunoTrack({
    trackName: song.item.name,
    artistName: song.item.artists[0].name,
  })

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

  if (!song || !song.item) {
    return null
  }

  return (
    <Details
      getAlbumById={handleGetAlbumById}
      name={name}
      artists={artists}
      album={{ ...album, ...extraAlbumData }}
      uri={uri}
      id={trackId}
      setSaved={setSaved}
      junoTrackInfo={junoTrackInfo}
    />
  )
}

const Details = ({
  uri,
  name,
  artists,
  album,
  id,
  setSaved,
  junoTrackInfo,
}) => {
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
          {name} - {album.name}
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
        className="label pointer"
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
      {junoTrackInfo && junoTrackInfo.trackUrl && (
        <a
          className="download-logo"
          target="_blank"
          href={junoTrackInfo.trackUrl}
        >
          <img src={JunoLogo} alt="juno download" />
        </a>
      )}
    </>
  )
}

export default DetailsData
