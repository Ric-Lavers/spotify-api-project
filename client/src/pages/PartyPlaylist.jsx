import React, { memo, useContext, useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { withCurrentSong } from '../hooks'
import {
  PlaylistTable,
  SavePlaylist,
  UserPlaylistsSelect,
} from '../components/AnalysisPlaylists'
import { sortPlaylistTracks } from './AnalysisPlaylists'
import { createUserPlaylistWithTracks } from 'api/spotify'
import { GlobalContext } from 'globalContext'
import { timeSince } from 'helpers'
import { specialPlaylists, savedTracks } from 'constants/index'
import { getUserPartyPlaylists, getPartyPlaylist } from 'api/party-playlist'
import { stats as _stats } from '../components/stats/Stats'
import EmojiLoader from '../components/common/EmojiLoader'
import UserCircles from '../components/common/UserCircles'

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
        userData: { id: userId, display_name },
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
  ({
    playlistId,
    currentPlayingId,
    spotify_user_id,
    topTrackIds,
    user: userData,
  }) => {
    const [
      {
        data: { user_ids, title, description, users },
        loading,
      },
      setData,
    ] = useState({
      data: {
        created_at: '',
        description: '',
        title: '',
        updated_at: '',
        user_ids: [],
      },
      loading: true,
    })
    const [tracks, setTracks] = useState([])
    const timeSinceUpdate = (() => {
      const u = (users || []).find(({ id }) => id === spotify_user_id)
      if (!u) return ''

      return timeSince(u.updated_at)
    })()
    const user =
      (users || []).find(({ id }) => id === spotify_user_id) || userData

    const isUserContributor = user_ids.includes(spotify_user_id)
    function getNsetPlaylist() {
      setData((s) => ({ ...s, loading: true }))
      getPartyPlaylist(playlistId).then((data) => {
        setData({ data, loading: false })
        setTracks(data.tracks)
      })
    }

    useEffect(() => {
      getNsetPlaylist()
    }, [playlistId])

    const [createState, setCreateState] = useState('')
    const [updateState, setUpdateState] = useState('')

    const handleAddToPartyPlaylist = async () => {
      setUpdateState('loading')
      const data = await addTopTracksToPlaylist(user, playlistId, topTrackIds)
      getNsetPlaylist()
      setUpdateState(data ? 'success' : 'error')
    }
    const handleUpdateToPartyPlaylist = async () => {
      setUpdateState('loading')
      const data = await updateTopTracksPlaylist(user, playlistId, topTrackIds)
      getNsetPlaylist()

      setUpdateState(data ? 'success' : 'error')
    }

    const includedUris = useMemo(() => {
      return tracks.filter((t) => t.include && !t.is_local).map((t) => t.uri)
    }, [tracks])

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
    function removeFinalStateEmjoi(currentState, setState) {
      if (currentState === 'loading') return
      const id = setTimeout(() => {
        setState('')
      }, 3000)
      return () => clearTimeout(id)
    }

    useEffect(
      () => removeFinalStateEmjoi(createState, setCreateState),
      [createState]
    )
    useEffect(
      () => removeFinalStateEmjoi(updateState, setUpdateState),
      [updateState]
    )

    //TODO just pass the value
    const handleSort = ({ target: { value } }) => {
      const [key, dir] = value.split('-')
      sortPlaylistTracks(key, dir, tracks, (sortedTracks) => {
        setTracks(sortedTracks)
      })
    }
    const initalFetchComplete = React.useRef(false)
    useEffect(() => {
      if (tracks.length && !initalFetchComplete.current) {
        initalFetchComplete.current = true
        handleSort({ target: { value: 'users-ASC' } })
      }
    }, [tracks])

    return (
      <div className="analysis-playlists">
        <h4>{title}</h4>
        {description && <p>{description}</p>}

        <UserCircles users={users} />
        {(!loading || createState || updateState) && (
          <>
            <p className="action-btn-group">
              <button
                className="s-button"
                onClick={
                  isUserContributor
                    ? handleUpdateToPartyPlaylist
                    : handleAddToPartyPlaylist
                }
              >
                {isUserContributor ? 'update' : 'add'} your tracks
                <EmojiLoader status={updateState} />
              </button>
              <span
                hidden={!timeSinceUpdate}
              >{`last updated ${timeSinceUpdate} ago`}</span>
            </p>
            <p className="action-btn-group">
              <button className="s-submit " onClick={handleCreatePlaylist}>
                save to your spotify
                <EmojiLoader status={createState} />
              </button>
            </p>
          </>
        )}
        <PlaylistTable
          loading={loading}
          tracks={tracks}
          currentTrackId={currentPlayingId}
          uris={includedUris || []}
          stats={['score', 'artists', 'users']}
          onAllCheck={(checked) => {}}
          onCheckTrack={(id, checked) => {}}
          onSort={handleSort}
          currentSortValue={'title'}
          users={users}
        />
      </div>
    )
  }
)
export default PartyPlaylist
