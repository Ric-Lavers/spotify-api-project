//@ts-nocheck
import React, { useMemo, memo, useState, useEffect } from 'react'
import get from 'lodash.get'

import { timeSince, formatFeatures } from 'helpers'
import { getPartyPlaylist } from 'api/party-playlist'
import UserCircles from '../../components/common/UserCircles'
import {
  PlaylistTable,
  SpotifyTrackGrid,
} from '../../components/AnalysisPlaylists'
import { stats as _stats } from '../../components/stats/Stats'
import PartyBlendsLayout from './Layout'
import { Survay_01 } from '../../pages/PartyPlaylist'

import {
  addTopTracksToPlaylist,
  updateTopTracksPlaylist,
  useSpotifyPlaylist,
} from './PartyPlaylist.utils'

const PartyPlaylistGroup: React.FC<any> = memo(
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
        data: { user_ids, title, description, users, length },
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
        tracks: [],
      },
      loading: true,
    })
    const [, setTracks] = useState([])
    const tracks = data.tracks
    const [limit, _setLimit] = useState(localStorage.getItem('limit') || 100)
    const [sort, setSort] = useState('')
    const setLimit = (limit) => {
      localStorage.setItem('limit', limit)
      _setLimit(limit)
    }

    const includedUris = useMemo(() => {
      return tracks.filter((t) => t.include && !t.is_local).map((t) => t.uri)
    }, [tracks])
    const currentTrack = React.useMemo(() => {
      return tracks.find((t) => t.id === currentPlayingId)
    }, [tracks, currentPlayingId])

    const user =
      (users || []).find(({ id }) => id === spotify_user_id) || userData

    const { createSpotifyPlaylist, updateSpotifyPlaylist } = useSpotifyPlaylist(
      user,
      playlistId
    )

    const [doing, setDoing] = useState('')
    const [updating, setUpdating] = useState(false)

    function initalisePlaylist() {
      setData((s) => ({ ...s, loading: true }))
      setDoing('initialising')
      getPartyPlaylist(playlistId, { limit })
        .then(async (data) => {
          setDoing('syncing your favourite tracks')
          //TODO move this to one fetch on BE
          const isUserContributor = data.user_ids.includes(spotify_user_id)
          await (isUserContributor
            ? updateTopTracksPlaylist(userData, playlistId, topTracks)
            : addTopTracksToPlaylist(userData, playlistId, topTracks))
          return data
        })
        .then(async (data) => {
          setDoing('saving to spotify')
          // updates the playlist to spotify
          //TODO move this to one fetch on BE
          const u = (data.users || []).find(({ id }) => id === spotify_user_id)
          await (get(u, `spotify_playlist_id`)
            ? updateSpotifyPlaylist(data.tracks, u.spotify_playlist_id)
            : createSpotifyPlaylist(data.tracks, {
                title: data.title,
                description: data.description,
              }).then((playlist) => {
                setData((prev) => {
                  const u = prev.data.users.find(
                    (u) => u.id === spotify_user_id
                  )
                  if (u && u.spotify_playlist_id) {
                    u.spotify_playlist_id = playlist.id
                  }

                  return prev
                })
              }))
        })
        .then(async () => {
          //TODO is this fetch required if the add track fetch returned data?
          const data = await getPartyPlaylist(playlistId, { limit })
          setTracks(data.tracks)
          setData({ data, loading: true })
          return data
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

    const setPlaylist = async (options) => {
      setUpdating(true)
      const th = document.getElementById('title-head')
      if (th) {
        const w = th.getBoundingClientRect().width
        th.style.width = w + 'px'
      }
      const data = await getPartyPlaylist(playlistId, options)

      setSort(options.sort || '')
      setTracks(data.tracks)
      setData({ data, loading: false })
      setUpdating(false)
      if (th) {
        th.style.removeProperty('width')
      }
    }
    useEffect(() => {
      setPlaylist({ sort, limit, direction: 'DESC' })
    }, [limit])

    const initialising = React.useRef(true)
    useEffect(() => {
      if (spotify_user_id && topTrackIds && initialising.current) {
        initalisePlaylist()
        initialising.current = false
      }
    }, [playlistId, spotify_user_id, topTrackIds])

    //TODO just pass the value
    const handleSort = ({ target: { value } }) => {
      const [sort, direction] = value.split('-')
      setPlaylist({ sort, direction })
    }
    const initalFetchComplete = React.useRef(false)
    useEffect(() => {
      if (tracks.length && !initalFetchComplete.current) {
        initalFetchComplete.current = true
        // handleSort({ target: { value: 'users-ASC' } })
      }
    }, [tracks])

    return (
      <PartyBlendsLayout enableBack>
        <div className="analysis-playlists PartyPlaylistGroup">
          {title && <h2> {title}</h2>}
          <span />

          {description && <p className="description">{description}</p>}

          <UserCircles users={users} />

          <CurrentlyPLaying currentTrack={currentTrack} users={users} />
          {!loading && (
            <>
              {get(user, `spotify_playlist_id`) && (
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
                  {/* window.location.origin.includes('rictify') && <p className="action-btn-group">
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
                  </p> */}
                </>
              )}
            </>
          )}

          <PlaylistTable
            loading={loading}
            updating={updating}
            loadingMessage={doing}
            tracks={tracks}
            currentTrackId={currentPlayingId}
            uris={includedUris || []}
            stats={['users', 'popularity', 'danceability']}
            onSort={handleSort}
            currentSortValue={'title'}
            users={users}
            defaultSort=""
            length={length}
            onLimitChange={setLimit}
            limit={limit}
          />
          <section>
            <Survay_01 />
          </section>
        </div>
      </PartyBlendsLayout>
    )
  }
)

const CurrentlyPLaying = ({ currentTrack, users = [] }) => {
  if (!currentTrack) {
    return null
  }
  const images = currentTrack.album.images
  return (
    <>
      <br />
      <fieldset className="currently-playing party-playlist">
        <legend>Currently playing</legend>

        <SpotifyTrackGrid
          currentlyPlaying
          name={currentTrack.name}
          artists={formatFeatures('artists', currentTrack)}
          imageUrl={images[images.length - 2].url}
          onClick={() => {
            document.getElementById(currentTrack.id).scrollIntoView()
          }}
          size="md"
        />

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
      </fieldset>
    </>
  )
}

export default PartyPlaylistGroup
