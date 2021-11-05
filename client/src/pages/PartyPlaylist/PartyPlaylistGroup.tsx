//@ts-nocheck
import React, { useMemo, memo, useState, useEffect, useRef } from 'react'
import get from 'lodash.get'
import { useHistory } from 'react-router-dom'

import { formatFeatures } from 'helpers'
import { getPartyPlaylist, removeUserFromPlaylist } from 'api/party-playlist'

import { ShareButtons } from 'components/share-buttons/ShareButtons'
import { Kebab, Menu } from 'components/common/s-menu'
import Tips from 'components/tips/Tips'
import UserCircles from '../../components/common/UserCircles'
import {
  Status as LoadingStatus,
  PlaylistTable,
  SpotifyTrackGrid,
} from '../../components/AnalysisPlaylists'
import { Survay_01 } from '../../pages/PartyPlaylist'
import {
  addTopTracksToPlaylist,
  updateTopTracksPlaylist,
  useSpotifyPlaylist,
} from './PartyPlaylist.utils'
import ShareIcon from 'images/share-icon.png'
import LoadingStrip from 'images/custom-svgs/Loading'

let sortKeys = [
  'danceability',
  'popularity',
  'energy',
  'valence',
  'speechiness',
  'acousticness',
  'tempo',
  'instrumentalness',
  'liveness',
  'zScore',
]
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
        data: { user_ids, title: _title, description, users, length },
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
    const history = useHistory()
    const [title, setTitle] = useState(_title)
    const [, setTracks] = useState([])
    const didMount = useRef(false)
    const tracks = data.tracks
    const [limit, _setLimit] = useState(localStorage.getItem('limit') || 100)
    const [selectedSort, setSelectedSort] = useState('danceability')
    const [sort, setSort] = useState('')
    const [direction, setDirection] = useState('')
    const getSortKey = (sort, direction) =>
      sort + direction ? [sort, direction].join('-') : ''
    const sortKey = getSortKey(sort, direction)
    const setLimit = (limit) => {
      localStorage.setItem('limit', limit)
      _setLimit(limit)
    }
    useEffect(() => {
      window.scrollTo(0, 0)
    }, [])

    useEffect(() => {
      setTitle(_title)
    }, [_title])

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

    const [doing, setDoing] = useState('initialising')
    const [updating, setUpdating] = useState(false)
    const [spotifyLinks, setSpotifyLinkIds] = useState({})
    const currentSpotifyLinkId = (spotifyLinks || {})[sortKey]

    function initalisePlaylist() {
      setDoing('initialising')
      setData((s) => ({ ...s, loading: true }))
      getPartyPlaylist(playlistId, { limit }, user.id)
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
          const currentSpotifyPlaylistId = get(u, `spotify_playlist_id.${''}`)
          if (currentSpotifyPlaylistId || currentSpotifyPlaylistId === '') {
            await updateSpotifyPlaylist(data.tracks, currentSpotifyPlaylistId)
            setSpotifyLinkIds(u.spotify_playlist_id)
          } else {
            const linkIds = await createSpotifyPlaylist(
              data.tracks,
              {
                title: data.title,
                description: data.description,
              },
              ''
            )
            setSpotifyLinkIds(linkIds)
          }
        })
        .then(async () => {
          //TODO is this fetch required if the add track fetch returned data?
          const data = await getPartyPlaylist(playlistId, { limit }, user.id)
          setTracks(data.tracks)
          setData({ data, loading: true })
          return data
        })
        .catch((err) => {
          console.log('error initaliis', err)
          setData((prev) => ({ ...prev, loading: false }))
        })
        .finally(() => {
          setData((prev) => {
            prev.loading = false
            return prev
          })
          setDoing('')
        })
    }

    const setPlaylist = async (options) => {
      setUpdating(true)
      const th = document.getElementById('title-head')
      if (th) {
        const w = th.getBoundingClientRect().width
        th.style.width = w + 'px'
      }
      const data = await getPartyPlaylist(playlistId, options, user.id)
      if (options.sort === 'users' || options.sort === '') {
        setSort('')
        setDirection('')
        setTitle(title.replace(/\s(\(\w+-[A-Z]+\))/, ''))
      } else {
        setSort(options.sort || '')
        setDirection(options.direction || '')
        setTitle(
          title.replace(/\s(\(\w+-[A-Z]+\))/, '') +
            ` (${getSortKey(options.sort, options.direction)})`
        )
      }
      setTracks(data.tracks)
      setData({ data, loading: false })
      if (
        options.sort !== '' &&
        spotifyLinks[getSortKey(options.sort, options.direction)]
      ) {
        updateSpotifyPlaylist(
          data.tracks,
          spotifyLinks[getSortKey(options.sort, options.direction)]
        )
      }
      setUpdating(false)
      if (th) {
        th.style.removeProperty('width')
      }
    }
    useEffect(() => {
      if (didMount.current) {
        setPlaylist({ sort, limit, direction })
      }
      didMount.current = true
    }, [limit])

    const initialising = React.useRef(true)
    useEffect(() => {
      if (spotify_user_id && topTrackIds && initialising.current) {
        initalisePlaylist()
        initialising.current = false
      }
    }, [playlistId, spotify_user_id, topTrackIds])

    //TODO just pass the value
    const handleSort = async ({ target: { value } }) => {
      const [sort, direction] = value.split('-')
      await setPlaylist({ sort, direction })
    }

    const handleActions = (value) => {
      if (sortKeys.includes(value)) {
        value && setSelectedSort(value)
        setSort(value)
        handleSort({ target: { value: [value, 'DESC'].join('-') } })
      }
      if (value === 'removeCurrentUser') {
        removeUserFromPlaylist(playlistId, spotify_user_id).then(() => {
          history.push('/')
        })
      }
      if (value && value.spotify_playlist_id) {
        window
          .open(
            `https://rictify.com/analysis/${value.spotify_playlist_id}?access_token=${sessionStorage.spotifyToken}`,
            '_blank'
          )
          .focus()
      }
    }
    const handleSaveToSpotify = async () => {
      const spotifyLinkIds = await createSpotifyPlaylist(
        tracks,
        {
          title,
          description: data.description,
        },
        sortKey
      )

      setSpotifyLinkIds(spotifyLinkIds)
    }
    const [openShare, setOpenShare] = useState(false)
    if (loading) {
      return (
        <LoadingStatus loading={loading}>
          <div style={{ minWidth: '80vw' }}>
            {doing}
            <LoadingStrip />
          </div>
        </LoadingStatus>
      )
    }
    return (
      <div className="analysis-playlists PartyPlaylistGroup">
        {title && <h2> {title}</h2>}
        <span />

        {description && <p className="description">{description}</p>}

        <UserCircles users={users}>
          <img
            src={ShareIcon}
            height="32px"
            width="32px"
            style={{
              borderRadius: '50%',
              background: 'white',
              padding: 4,
              marginLeft: 8,
            }}
            className="pointer"
            onClick={() => setOpenShare(!openShare)}
          />
        </UserCircles>

        {openShare && (
          <section style={{ marginTop: 16 }}>
            <ShareButtons />
          </section>
        )}
        <CurrentlyPLaying currentTrack={currentTrack} users={users} />

        <Actions
          onClick={handleActions}
          loading={!tracks.length || loading}
          user={user}
          currentSpotifyLinkId={currentSpotifyLinkId}
          onSaveToSpotify={handleSaveToSpotify}
        />

        <PlaylistTable
          loading={loading}
          updating={updating}
          loadingMessage={doing}
          tracks={tracks}
          currentTrackId={currentPlayingId}
          uris={includedUris || []}
          stats={['users', selectedSort]}
          onSort={handleSort}
          currentSortValue={[sort, direction].join('-')}
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
    )
  }
)

const Actions = ({
  onClick,
  loading,
  updating,
  currentSpotifyLinkId,
  onSaveToSpotify,
}) => {
  const [actionsOpen, setActionsOpen] = useState(false)
  const handleClick = (arg) => {
    onClick(arg)
    setActionsOpen(false)
  }

  return loading ? null : (
    <>
      <div className="actions">
        <p className="action-btn-group">
          {currentSpotifyLinkId ? (
            // TODO when the sort playlist exists update it with current list
            <a
              style={{
                textDecoration: 'none',
                height: 'inherit',
                lineHeight: '32px',
              }}
              className={`s-submit`}
              target="_blank"
              rel="noopener noreferrer"
              href={`https://open.spotify.com/playlist/${currentSpotifyLinkId}`}
            >
              Open in Spotify
            </a>
          ) : (
            <a
              style={{
                textDecoration: 'none',
                height: 'inherit',
                lineHeight: '32px',
              }}
              className="s-submit secondary"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onSaveToSpotify}
            >
              Save to Spotify
            </a>
          )}
        </p>
        <div>
          <Kebab onClick={setActionsOpen} className="actions-kebab">
            <Menu
              open={actionsOpen}
              list={[
                {
                  value: '',
                  label: 'sort by',
                  list: sortKeys.map((k) => ({ value: k, label: k })),
                },
                {
                  value: 'removeCurrentUser',
                  label: 'remove yourself from blend',
                },
                ...(currentSpotifyLinkId
                  ? [
                      {
                        value: { spotify_playlist_id: currentSpotifyLinkId },
                        label: 'analysis',
                      },
                    ]
                  : []),
              ]}
              onClick={handleClick}
              onClickOutside={() => setActionsOpen(false)}
            />
          </Kebab>
        </div>
      </div>
    </>
  )
}

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
