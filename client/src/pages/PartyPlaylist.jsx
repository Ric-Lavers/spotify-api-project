import React, { memo, useContext, useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { withCurrentSong } from '../hooks'
import {
  PlaylistTable,
  SavePlaylist,
  UserPlaylistsSelect,
} from '../components/AnalysisPlaylists'
import { sortPlaylistTracks } from './AnalysisPlaylists'
import {
  createUserPlaylistWithTracks,
  updateUserPlaylistTracks,
} from 'api/spotify'
import { GlobalContext } from 'globalContext'
import { timeSince } from 'helpers'
import { specialPlaylists, savedTracks } from 'constants/index'
import {
  getUserPartyPlaylists,
  getPartyPlaylist,
  saveSpotifyPlaylistId,
} from 'api/party-playlist'
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

const useWait = (ms = 8000) => {
  let [__, set__] = useState(true)
  useEffect(() => {
    Promise.all([new Promise((res) => setTimeout(res, ms))]).then(() =>
      set__(false)
    )
  }, [])
  return __
}

const Survay_01 = () => {
  const __ = useWait()
  if (__) return null

  return (
    <a
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
        <>
          <PartyPlaylistGroup
            playlistId={playlistId}
            currentPlayingId={currentSong ? currentSong.item.id : ''}
            spotify_user_id={userId}
            user={userData}
            topTrackIds={getTopTrackIds(topTracks)}
          />
          <section>
            <Survay_01 />
          </section>
        </>
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
      getPartyPlaylist(playlistId)
        .then((data) => {
          setData({ data, loading: false })
          setTracks(data.tracks)
        })
        .catch(() => setData((prev) => ({ ...prev, loading: false })))
    }

    useEffect(() => {
      getNsetPlaylist()
    }, [playlistId])

    const [createState, setCreateState] = useState('')
    const [updateState, setUpdateState] = useState('')

    const handleAddToPartyPlaylist = async () => {
      setUpdateState('loading')
      const data = await addTopTracksToPlaylist(
        userData,
        playlistId,
        topTrackIds
      )
      getNsetPlaylist()
      setUpdateState(data ? 'success' : 'error')
    }

    const handleUpdateToPartyPlaylist = async () => {
      setUpdateState('loading')
      const data = await updateTopTracksPlaylist(
        userData,
        playlistId,
        topTrackIds
      )
      getNsetPlaylist()

      setUpdateState(data ? 'success' : 'error')
    }

    const includedUris = useMemo(() => {
      return tracks.filter((t) => t.include && !t.is_local).map((t) => t.uri)
    }, [tracks])

    const handleCreateSpotifyPlaylist = async () => {
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

      await saveSpotifyPlaylistId(spotify_user_id, playlistId, data.id)

      setCreateState(data ? 'success' : 'error')
      return data
    }
    const handleUpdateSpotifyPlaylist = async () => {
      if (!includedUris.length || !user.spotify_playlist_id) {
        setCreateState('error')
        return
      }
      setCreateState('loading')

      const data = await updateUserPlaylistTracks(
        user.spotify_playlist_id,
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
                disabled={updateState === 'loading'}
              >
                {isUserContributor ? 'update' : 'add'} your tracks
                <span style={{ fontSize: 12 }}>
                  <EmojiLoader status={updateState} />
                </span>
              </button>
              <span
                hidden={!timeSinceUpdate}
              >{`last updated ${timeSinceUpdate} ago`}</span>
            </p>
            <p className="action-btn-group">
              <button
                className="s-submit "
                onClick={
                  user.spotify_playlist_id
                    ? handleUpdateSpotifyPlaylist
                    : handleCreateSpotifyPlaylist
                }
                disabled={createState === 'loading'}
              >
                {`${
                  user.spotify_playlist_id ? 'update' : 'save to'
                } your spotify`}
                <span style={{ fontSize: 12 }}>
                  <EmojiLoader status={createState} />
                </span>
              </button>
            </p>
            {user.spotify_playlist_id && (
              <p className="action-btn-group">
                <a
                  style={{
                    textDecoration: 'none',
                    height: 'inherit',
                    lineHeight: '32px',
                  }}
                  className="s-submit"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://open.spotify.com/playlist/${user.spotify_playlist_id}`}
                >
                  Open in Spotify
                </a>
              </p>
            )}
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
