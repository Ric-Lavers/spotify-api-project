import React, { memo, useContext, useState, useEffect, useMemo } from 'react'
import { useParams, useHistory } from 'react-router-dom'

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

    if (playlistId) {
      //TODO move this into its own page, fo realz
      return (
        <>
          <PartyPlaylistGroup
            playlistId={playlistId}
            currentPlayingId={currentSong ? currentSong.item.id : ''}
            spotify_user_id={userId}
            user={userData}
            topTrackIds={!loadingTopTracks && getTopTrackIds(topTracks)}
            topTracks={topTracks}
          />
        </>
      )
    }
    if (!userId || loadingTopTracks) {
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

const useSpotifyPlaylist = (user, playlistId) => {
  const [createState, setCreateState] = useState('')

  const includedUris = (tracks) => {
    return tracks.filter((t) => t.include && !t.is_local).map((t) => t.uri)
  }

  const createSpotifyPlaylist = async (tracks, { title, description }) => {
    const uris = includedUris(tracks)
    if (!uris.length) return
    setCreateState('loading')
    const data = await createUserPlaylistWithTracks(
      user.id,
      {
        name: title,
        description: `${description}  -  ${window.location.href}`,
        isPublic: false,
        collaborative: true,
      },
      uris
    )

    await saveSpotifyPlaylistId(user.id, playlistId, data.id)

    setCreateState(data ? 'success' : 'error')
    return data
  }

  const updateSpotifyPlaylist = async (tracks, spotify_playlist_id) => {
    const uris = includedUris(tracks)
    if (!uris.length || !spotify_playlist_id) {
      setCreateState('error')
      return
    }
    setCreateState('loading')

    const data = await updateUserPlaylistTracks(spotify_playlist_id, uris)

    setCreateState(data ? 'success' : 'error')
    return data
  }

  return {
    createState,
    createSpotifyPlaylist,
    updateSpotifyPlaylist,
  }
}

const PartyPlaylistGroup = memo(
  ({
    playlistId,
    currentPlayingId,
    spotify_user_id,
    topTrackIds,
    user: userData,
    topTracks,
  }) => {
    const [
      {
        data,
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
        users: [],
      },
      loading: true,
    })
    const [tracks, setTracks] = useState([])
    const currentTrack = React.useMemo(() => {
      return tracks.find((t) => t.id === currentPlayingId)
    }, [tracks, currentPlayingId])
    const timeSinceUpdate = (() => {
      const u = (users || []).find(({ id }) => id === spotify_user_id)
      if (!u) return ''

      return timeSince(u.updated_at)
    })()
    const user =
      (users || []).find(({ id }) => id === spotify_user_id) || userData

    const { createSpotifyPlaylist, updateSpotifyPlaylist } = useSpotifyPlaylist(
      user,
      playlistId
    )
    const [doing, setDoing] = useState('')
    const isUserContributor = user_ids.includes(spotify_user_id)
    function getNsetPlaylist() {
      setData((s) => ({ ...s, loading: true }))
      setDoing('initialising')
      getPartyPlaylist(playlistId)
        .then(async (data) => {
          setDoing('syncing your favourite tracks')
          const isUserContributor = data.user_ids.includes(spotify_user_id)
          await (isUserContributor
            ? updateTopTracksPlaylist(userData, playlistId, topTracks)
            : addTopTracksToPlaylist(userData, playlistId, topTracks))
          return data
        })
        .then(async () => {
          setDoing('saving to spotify')
          const data = await getPartyPlaylist(playlistId)
          setTracks(data.tracks)
          setData({ data, loading: true })
          return data
        })
        .then(async (data) => {
          const u = (data.users || []).find(({ id }) => id === spotify_user_id)
          await (u.spotify_playlist_id
            ? updateSpotifyPlaylist(data.tracks, u.spotify_playlist_id)
            : createSpotifyPlaylist(data.tracks, {
                title: data.title,
                description: data.description,
              }).then((playlist) => {
                setData((prev) => {
                  const u = prev.data.users.find(
                    (u) => u.id === spotify_user_id
                  )
                  if (u) {
                    u.spotify_playlist_id = playlist.id
                  }

                  return prev
                })
              }))
        })
        .catch(() => setData((prev) => ({ ...prev, loading: false })))
        .finally(() => {
          setDoing('')
          setData((prev) => {
            prev.loading = false
            return prev
          })
        })
    }

    const initialising = React.useRef(true)
    useEffect(() => {
      if (spotify_user_id && topTrackIds && initialising.current) {
        getNsetPlaylist()
        initialising.current = false
      }
    }, [playlistId, spotify_user_id, topTrackIds])

    const [createState, setCreateState] = useState('')
    const [updateState, setUpdateState] = useState('')
    const includedUris = useMemo(() => {
      return tracks.filter((t) => t.include && !t.is_local).map((t) => t.uri)
    }, [tracks])

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
        <CurrentlyPLaying currentTrack={currentTrack} users={users} />

        {(!loading || createState || updateState) && (
          <>
            {user.spotify_playlist_id && (
              <>
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
                <p className="action-btn-group">
                  <a
                    style={{
                      textDecoration: 'none',
                      height: 'inherit',
                      lineHeight: '32px',
                    }}
                    className="s-button"
                    href={`/analysis/${user.spotify_playlist_id}`}
                  >
                    Filter this Playlist
                  </a>
                </p>
              </>
            )}
          </>
        )}

        <PlaylistTable
          loading={loading}
          loadingMessage={doing}
          tracks={tracks}
          currentTrackId={currentPlayingId}
          uris={includedUris || []}
          stats={['score', 'users', 'popularity', 'danceability']}
          onSort={handleSort}
          currentSortValue={'title'}
          users={users}
        />
      </div>
    )
  }
)

const CurrentlyPLaying = ({ currentTrack, users = [] }) => {
  if (!currentTrack) {
    return null
  }
  return (
    <>
      <br />
      <fieldset className="currently-playing party-playlist">
        <legend>Currently playing</legend>
        <a
          href={`#${currentTrack.id}`}
          className="currently-playing party-playlist"
        >
          <div>
            {currentTrack.name} ({currentTrack.custom.score})
          </div>
          <UserCircles
            size="small"
            users={(users || []).filter((u) =>
              (currentTrack.custom.user_ids || []).find((id) => {
                const actualUserId = id
                  .replace('-short_term', '')
                  .replace('-medium_term', '')
                  .replace('-long_term', '')

                return u.id === actualUserId
              })
            )}
          />
        </a>
      </fieldset>
    </>
  )
}
export default PartyPlaylist
