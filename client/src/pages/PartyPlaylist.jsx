import React, { useContext, useState, useEffect } from 'react'
import Favicon from 'react-favicon'
import { useParams, useHistory } from 'react-router-dom'

import { withCurrentSong } from '../hooks'
import {
  SavePlaylist,
  UserPlaylistsSelect,
} from '../components/AnalysisPlaylists'
import { GlobalContext } from 'globalContext'
import { getUserPartyPlaylists } from 'api/party-playlist'
import PartyBlendsFavi from '../images/party-blends-favi.png'
import PartyPlaylistGroup from './PartyPlaylist/PartyPlaylistGroup'
import PartyBlendsLayout from './PartyPlaylist/Layout'
import {
  useTopTracks,
  getTopTrackIds,
  createTopTracksPlaylist,
  formatUserPlaylists,
} from './PartyPlaylist.utils'

const useWait = (ms = 8000) => {
  let [__, set__] = useState(true)
  useEffect(() => {
    Promise.all([new Promise((res) => setTimeout(res, ms))]).then(() =>
      set__(false)
    )
  }, [])
  return __
}

export const Survay_01 = () => {
  const __ = useWait()
  if (__) return null

  return (
    <a
      target="_blank"
      style={{ color: 'white' }}
      href="https://docs.google.com/forms/d/e/1FAIpQLSeWAyEF_ToiQwQPDFrExodO-NZDVRQ2eDnr2DIZq3fAjdp8Uw/viewform"
    >
      Give Ric some feedback!
    </a>
  )
  return (
    <iframe
      src="https://docs.google.com/forms/d/e/1FAIpQLSeWAyEF_ToiQwQPDFrExodO-NZDVRQ2eDnr2DIZq3fAjdp8Uw/viewform?embedded=true"
      width="640"
      height="752"
      frameborder="0"
      marginheight="0"
      marginwidth="0"
    >
      Loading…
    </iframe>
  )
}

const PartyPlaylist = React.memo(
  withCurrentSong(({ currentSong }) => {
    const [
      {
        userData,
        userData: { id: userId, display_name },
      },
    ] = useContext(GlobalContext)
    const history = useHistory()
    const { playlistId } = useParams()
    const { topTracks, loading: loadingTopTracks } = useTopTracks(userId)
    const [playlists, setPlaylists] = useState([])
    const createPartyPlaylist = async ({
      name: title,
      description,
      isPublic,
    }) => {
      const data = await createTopTracksPlaylist(
        userData,
        { title, description, isPublic, collaborative: true },
        topTracks
      )
      if (data && data._id) {
        handleChangePlaylist(data._id)
      }
      return data
    }

    useEffect(() => {
      if (userId) {
        getUserPartyPlaylists(userId).then((playlists) => {
          setPlaylists(formatUserPlaylists(playlists))
        })
      }
    }, [userId])
    const handleChangePlaylist = (partyPlaylistId) => {
      history.push(`/party-playlist/${partyPlaylistId}`)
    }
    useEffect(() => {
      document.title = 'Party Blends'
    }, [])

    if (playlistId) {
      //TODO move this into its own page, fo realz
      return (
        <>
          <Favicon url={PartyBlendsFavi} />
          <PartyBlendsLayout enableBack>
            <PartyPlaylistGroup
              playlistId={playlistId}
              currentPlayingId={currentSong ? currentSong.item.id : ''}
              spotify_user_id={userId}
              user={userData}
              topTrackIds={!loadingTopTracks && getTopTrackIds(topTracks)}
              topTracks={topTracks}
            />
          </PartyBlendsLayout>
        </>
      )
    }

    if (loadingTopTracks) {
      return (
        <PartyBlendsLayout>
          <div>loading...</div>
        </PartyBlendsLayout>
      )
    }
    if (!userId) {
      return (
        <PartyBlendsLayout>
          <div>cant find you on this list</div>
        </PartyBlendsLayout>
      )
    }

    return (
      <PartyBlendsLayout>
        <Favicon url={PartyBlendsFavi} />
        <div className="analysis-playlists">
          <SavePlaylist
            hideCollaborative
            hidePublic
            user_id={userId}
            createPlaylist={createPartyPlaylist}
          />
        </div>
        {playlists.length !== 0 && (
          <div className="analysis-playlists">
            <UserPlaylistsSelect
              label={'select your party playlist'}
              onChange={handleChangePlaylist}
              playlists={playlists}
              currentPlaylistId={playlistId}
            />
          </div>
        )}
      </PartyBlendsLayout>
    )
  })
)

export default PartyPlaylist
