import React, { memo, useContext, useState, useEffect, useMemo } from 'react'
import Slide from 'react-reveal/Slide'
import makeCarousel from 'react-reveal/makeCarousel'
import truncate from 'lodash.truncate'
import get from 'lodash.get'
import { useParams } from 'react-router-dom'

import Range from 'components/common/RangeSlider'
import { withCurrentSong } from '../hooks'
import {
  PlaylistTable,
  SavePlaylist,
  CurrentPlaylist,
  UserPlaylistsSelect,
} from '../components/AnalysisPlaylists'
import { createUserPlaylistWithTracks } from 'api/spotify'
import { GlobalContext } from 'globalContext'
import { combineArtists } from 'helpers'
import { specialPlaylists, savedTracks } from 'constants/index'
import { getUserPartyPlaylists, getPartyPlaylist } from 'api/party-playlist'
import { stats as _stats } from '../components/stats/Stats'
import {
  useTopTracks,
  getTopTrackIds,
  createTopTracksPlaylist,
  formatUserPlaylists,
  addTopTracksToPlaylist,
  updateTopTracksPlaylist,
} from './PartyPlaylist.utils'

const favPlaylists = [...specialPlaylists, savedTracks]

const Dev = ({ data }) => (
  <>
    <code style={{ fontSize: 9 }}>
      <pre>{JSON.stringify(data, null, 1)}</pre>
    </code>
  </>
)

const PartyPlaylist = React.memo(
  withCurrentSong(({ currentSong }) => {
    const [
      {
        userData,
        userData: { id: userId },
      },
    ] = useContext(GlobalContext)

    const { playlistId } = useParams()
    const { topTracks, loading } = useTopTracks(userId)
    const [playlists, setPlaylists] = useState([])

    const createPartyPlaylist = async ({
      name: title,
      description,
      isPublic,
    }) => {
      const data = await createTopTracksPlaylist(
        userData,
        { title, description, isPublic, collaborative: true },
        getTopTrackIds(topTracks)
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
      window.location.replace(`/party-playlist/${partyPlaylistId}`)
    }

    if (playlistId) {
      return (
        <PartyPlaylistGroup
          playlistId={playlistId}
          currentPlayingId={currentSong ? currentSong.item.id : ''}
          spotify_user_id={userId}
          user={userData}
          topTrackIds={getTopTrackIds(topTracks)}
        />
      )
    }
    if (!userId || loading) {
      return <div>loading...</div>
    }

    return (
      <>
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
      </>
    )
  })
)

const PartyPlaylistGroup = memo(
  ({ playlistId, currentPlayingId, spotify_user_id, user, topTrackIds }) => {
    const [
      {
        data: { tracks, user_ids, title, description },
        loading,
      },
      setData,
    ] = useState({
      data: {
        created_at: '',
        description: '',
        title: '',
        tracks: [],
        updated_at: '',
        user_ids: [],
      },
      loading: true,
    })

    const isUserContributor = user_ids.includes(spotify_user_id)

    useEffect(() => {
      setData((s) => ({ ...s, loading: true }))
      getPartyPlaylist(playlistId).then((data) =>
        setData({ data, loading: false })
      )
    }, [playlistId])
    const [createState, setCreateState] = useState('')
    const [updateState, setUpdateState] = useState('')

    const handleAddToPartyPlaylist = async () => {
      setUpdateState('loading')
      const data = await addTopTracksToPlaylist(user, playlistId, topTrackIds)
      setUpdateState(data ? 'success' : 'error')
    }
    const handleUpdateToPartyPlaylist = async () => {
      setUpdateState('loading')
      const data = await updateTopTracksPlaylist(user, playlistId, topTrackIds)

      setUpdateState(data ? 'success' : 'error')
    }

    const includedUris = useMemo(
      () => tracks.filter((t) => t.include && !t.is_local).map((t) => t.uri),
      [tracks]
    )

    const handleCreatePlaylist = async () => {
      if (!includedUris.length) return
      setCreateState('loading')
      const data = await createUserPlaylistWithTracks(
        spotify_user_id,
        {
          name: title,
          description: description,
          isPublic: false,
          collaborative: true,
        },
        includedUris
      )

      setCreateState(data ? 'success' : 'error')
      return data
    }
    useEffect(() => {
      const id = setTimeout(() => {
        setCreateState('')
      }, 3000)
      return () => clearTimeout(id)
    }, [createState])
    useEffect(() => {
      const id = setTimeout(() => {
        setUpdateState('')
      }, 3000)
      return () => clearTimeout(id)
    }, [updateState])

    return (
      <div className="analysis-playlists">
        {!loading && (
          <>
            <p>
              <button
                className="s-button"
                onClick={
                  isUserContributor
                    ? handleUpdateToPartyPlaylist
                    : handleAddToPartyPlaylist
                }
              >
                {isUserContributor ? 'update' : 'add'} ya tracks
                {updateState === 'loading' && '🤞'}
                {updateState === 'success' && '👍'}
                {updateState === 'error' && '👎'}
              </button>
            </p>
            <p>
              <button className="s-submit " onClick={handleCreatePlaylist}>
                save to spotify
                {createState === 'loading' && '🤞'}
                {createState === 'success' && '👍'}
                {createState === 'error' && '👎'}
              </button>
            </p>
          </>
        )}
        <PlaylistTable
          loading={loading}
          tracks={tracks}
          currentTrackId={currentPlayingId}
          uris={includedUris || []}
          stats={['score']}
          onAllCheck={(checked) => {}}
          onCheckTrack={(id, checked) => {}}
          onSort={({ target: { value } }) => {}}
          currentSortValue={'title'}
        />
      </div>
    )
  }
)

export default PartyPlaylist
