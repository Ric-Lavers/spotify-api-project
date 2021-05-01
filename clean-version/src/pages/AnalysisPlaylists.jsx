import React, { memo, useContext, useState, useEffect } from 'react'
import Slide from 'react-reveal/Slide'
import makeCarousel from 'react-reveal/makeCarousel'
import truncate from 'lodash.truncate'
import get from 'lodash.get'
import { useParams } from 'react-router-dom'

import Range from 'components/common/RangeSlider'
import { useToggle, withCurrentSong } from 'hooks'
import {
  PlaylistTable,
  SavePlaylist,
  CurrentPlaylist,
  UserPlaylistsSelect,
} from 'components/AnalysisPlaylists'
import {
  getAllPlaylistsTracks,
  getMePlaylists,
  getHeapsAudioFeatures,
  play,
  createUserPlaylistWithTracks,
} from 'api/spotify'
import { stats as _stats } from '../components/stats/Stats'
import { GlobalContext } from 'globalContext'
import PopularityMeter from 'images/custom-svgs/PopularityMeter'
import { combineArtists } from 'helpers'
import { specialPlaylists, savedTracks } from 'constants/index'
const favPlaylists = [...specialPlaylists, savedTracks]

const tableKeys = ['artists', 'albumName', ..._stats]

const tableKeyToObjectKey = (tableKey, song) => {
  if (tableKey === 'artists') {
    return 'artists[0].name'
  }
  if (tableKey === 'albumName') {
    return 'album.name'
  } else if (song[0].audioFeatures.hasOwnProperty(tableKey)) {
    return `audioFeatures.${tableKey}`
  }
  return tableKey
}

const getSongsWithAudioFeatures = async (playlistId) => {
  const { items } = await getAllPlaylistsTracks(playlistId)
  const songIds = items.map(({ track }) => track.id)
  const audioFeatures = await getHeapsAudioFeatures(songIds)

  const songs = items.map(({ track }, i) => ({
    ...track,
    audioFeatures: audioFeatures[i],
    include: true,
  }))
  return songs
}

const useSongsWithAudioFeatures = (playlistId) => {
  const [loading, setLoading] = useState(false)
  const [songWithFeatures, setSongWithFeatures] = useState([])
  const [currentSort, setCurrentSort] = useState('')
  const didMergeTrack = React.useRef(false)
  const [minMax, setMinMax] = useState([0, 0])

  const getTrackByPlaylist = async () => {
    setLoading(true)
    setSongWithFeatures(await getSongsWithAudioFeatures(playlistId))
    setLoading(false)
  }
  useEffect(async () => {
    getTrackByPlaylist()
  }, [])

  const mergeMoreTracks = (tracksWithAudioFeatures) => {
    const trackIds = new Set()
    setSongWithFeatures((prev) =>
      [...prev, ...tracksWithAudioFeatures].filter(({ id }) => {
        if (trackIds.has(id)) return false
        return !!trackIds.add(id)
      })
    )
    didMergeTrack.current = true
  }
  useEffect(() => {
    if (songWithFeatures.length) {
      const [tableKey, direction] = currentSort.split(' - ')
      sortTracks(tableKey, direction)
      didMergeTrack.current = false
    }
  }, [didMergeTrack.current])

  const sortTracks = (tableKey, direction = 'ASC') => {
    const newSort = `${tableKey} - ${direction}`
    setCurrentSort(newSort)

    const key = tableKeyToObjectKey(tableKey, songWithFeatures)

    const keyType = typeof get(songWithFeatures[0], key)
    if (get(songWithFeatures[0], key) === undefined) return

    if (keyType === 'string') {
      const sorted =
        direction === 'ASC'
          ? songWithFeatures.sort((a, b) =>
              get(a, key).localeCompare(get(b, key))
            )
          : songWithFeatures
              .sort((a, b) =>
                get(a, key)
                  .toUpperCase()
                  .localeCompare(get(b, key).toUpperCase())
              )
              .reverse()
      setMinMax([0, 0])
      setSongWithFeatures([...sorted])
    }

    if (keyType === 'number') {
      const values = []
      const sorted = songWithFeatures.sort((a, b) => {
        values.push(get(b, key))
        return direction === 'ASC'
          ? get(a, key) - get(b, key)
          : get(b, key) - get(a, key)
      })
      const min = Math.min(...values)
      const max = Math.max(...values)

      setMinMax([min, max])
      setSongWithFeatures([...sorted])
    }
  }

  const uris = songWithFeatures.map(({ uri }) => uri)
  const includedUris = songWithFeatures
    .filter(({ include }) => include)
    .map(({ uri }) => uri)
    .filter((uri) => !uri.match('spotify:local'))

  const checkIncludeAll = (bool) => {
    setSongWithFeatures((prev) =>
      prev.map((track) => ({ ...track, include: bool }))
    )
  }
  const checkById = (id, bool) => {
    setSongWithFeatures((prev) => {
      prev.find(({ id: trackId }) => trackId === id).include = bool

      return [...prev]
    })
  }

  const checkByRange = ([min, max]) => {
    const [tableKey] = currentSort.split(' -')
    const key = tableKeyToObjectKey(tableKey, songWithFeatures)
    setSongWithFeatures((prev) => {
      prev.map((track) => {
        const field = get(track, key)
        track.include = field <= max && field >= min
      })
      return [...prev]
    })
  }

  return [
    songWithFeatures,
    {
      mergeMoreTracks,
      sortTracks,
      uris,
      includedUris,
      currentSort,
      checkIncludeAll,
      checkById,
      checkByRange,
      minMax,
      loading,
    },
  ]
}

const useStatKeys = (whiteStatsList = []) => {
  const [whiteList, setWhiteList] = useState(new Set(whiteStatsList))

  const BlackStatList = ({ hide }) => {
    const handleCheck = ({ target: { checked, id } }) => {
      checked ? whiteList.add(id) : whiteList.delete(id)
      setWhiteList(new Set(whiteList))
      localStorage.setItem('preferedStatKeys', JSON.stringify([...whiteList]))
    }
    return (
      <form
        style={hide ? { display: 'none' } : {}}
        onChange={handleCheck}
        className="stat-check-list"
      >
        {tableKeys.map((stat) => (
          <div className="stat-checkbox">
            <label htmlFor={stat}>{stat}</label>
            <input id={stat} type="checkbox" checked={whiteList.has(stat)} />
          </div>
        ))}
        <div className="stat-checkbox" />
      </form>
    )
  }
  return [[...whiteList], BlackStatList]
}

const useMePlaylists = () => {
  const [playlists, setPlaylists] = useState([])

  const getPlaylists = async () => {
    const { items } = await getMePlaylists()

    setPlaylists([...favPlaylists, ...items])
  }

  useEffect(getPlaylists, [])

  return [playlists, getPlaylists]
}

const useMergePlaylist = ({ mergeMoreTracks, currentPlaylistId }) => {
  const [mergeLoadingStatus, setLoadingMerge] = useState('')
  const [mergedPlaylistIds, setMergedPlaylistIds] = useState(
    [currentPlaylistId].filter(Boolean)
  )
  const handleMergeNewPlaylist = async (playlistId) => {
    setLoadingMerge('🤞')
    const moreTracks = await getSongsWithAudioFeatures(playlistId)
    mergeMoreTracks(moreTracks)
    setMergedPlaylistIds((prev) => [...prev, playlistId])
    setLoadingMerge(moreTracks.length ? '👍' : '👎')
    setTimeout(() => {
      setLoadingMerge('')
    }, 3000)
  }

  return {
    mergeLoadingStatus,
    mergedPlaylistIds,
    handleMergeNewPlaylist,
  }
}

const AnalysisPlaylistsPage = React.memo(({ currentSong }) => {
  const [
    {
      userData: { id: userId },
    },
  ] = useContext(GlobalContext)
  const { playlistId } = useParams()
  const [playlists, getPlaylists] = useMePlaylists()
  const currentPlaylist = playlists.find(({ id }) => id === playlistId)

  const [
    tracks,
    {
      loading,
      mergeMoreTracks,
      sortTracks,
      uris,
      includedUris,
      currentSort,
      checkIncludeAll,
      checkById,
      checkByRange,
      minMax: [min, max],
    },
  ] = useSongsWithAudioFeatures(playlistId)

  const preferedStatKeys = JSON.parse(
    localStorage.getItem('preferedStatKeys')
  ) || ['popularity', 'danceability', 'tempo']
  const [stats, BlackStatList] = useStatKeys(preferedStatKeys)

  const [currentSortValue, setCurrentSortValue] = useState('')
  const handleSort = ({ target: { value } }) => {
    if (!value) {
      console.warn('currently not tracking original plauylist order')
      return
    }
    setCurrentSortValue(value)
    const [v, d] = value.split('-')
    sortTracks(v, d)
  }

  const currentTrackId = get(currentSong, 'item.id')
  const [isHidden, toggleHidden] = useToggle(true)
  const handleChangePlaylist = (playlistId) => {
    playlistId && window.location.replace(`/analysis/${playlistId}`)
  }

  const {
    mergeLoadingStatus,
    mergedPlaylistIds,
    handleMergeNewPlaylist,
  } = useMergePlaylist({
    mergeMoreTracks,
    currentPlaylistId: playlistId,
  })

  const handleCreatePlaylist = async ({
    name,
    description,
    isPublic,
    collaborative,
  }) => {
    if (!includedUris.length) return
    const playlist = await createUserPlaylistWithTracks(
      userId,
      {
        name,
        description,
        isPublic,
        collaborative,
      },
      includedUris
    )
    await getPlaylists()
    return playlist
  }

  return (
    <>
      <div className="analysis-playlists">
        <UserPlaylistsSelect
          label={'select a playlist'}
          onChange={handleChangePlaylist}
          playlists={playlists}
          currentPlaylistId={playlistId}
        />
        <CurrentPlaylist currentPlaylist={currentPlaylist} />
      </div>
      <div className="analysis-playlists">
        {currentPlaylist && (
          <>
            <UserPlaylistsSelect
              label={'Merge another playlist'}
              onChange={handleMergeNewPlaylist}
              playlists={playlists.filter(
                ({ id }) => !mergedPlaylistIds.includes(id)
              )}
              currentPlaylistId={''}
              loadingStatus={mergeLoadingStatus}
            />

            <SavePlaylist
              user_id={userId}
              currentPlaylist={currentPlaylist}
              currentSort={currentSort}
              createPlaylist={handleCreatePlaylist}
              description={currentPlaylist.description}
            />
          </>
        )}
      </div>
      <div className="analysis-playlists">
        <BlackStatList hide={isHidden} />
        {min + max !== 0 && (
          <Range min={min} max={max} onRangeChange={checkByRange} />
        )}

        <div>
          <button onClick={toggleHidden}>
            table settings (audio features)
          </button>

          <select value={currentSortValue} onChange={handleSort}>
            <option value="">unsorted</option>
            {tableKeys.map((key) => (
              <>
                <option value={`${key}-ASC`}>{key} - ASC</option>
                <option value={`${key}-DESC`}>{key} - DESC</option>
              </>
            ))}
          </select>
        </div>
      </div>

      <PlaylistTable
        loading={loading}
        tracks={tracks}
        onSort={handleSort}
        currentSortValue={currentSortValue}
        currentTrackId={currentTrackId}
        uris={uris}
        stats={stats}
        onAllCheck={checkIncludeAll}
        onCheckTrack={checkById}
      />
    </>
  )
})

export default withCurrentSong(AnalysisPlaylistsPage)
