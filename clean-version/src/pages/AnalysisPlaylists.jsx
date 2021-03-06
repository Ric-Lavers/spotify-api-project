import React, { useCallback, useContext, useState, useEffect } from 'react'
import get from 'lodash.get'
import { useParams } from 'react-router-dom'

import Range from 'components/common/RangeSlider'
import { useToggle, withCurrentSong, usePollCurrentSong } from 'hooks'
import { FetchProvider } from '../hooks/useFetchCache'
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
  createUserPlaylistWithTracks,
} from 'api/spotify'
import { stats as _stats } from '../components/stats'
import { GlobalContext } from 'globalContext'
import { specialPlaylists, savedTracks } from 'constants/index'
const favPlaylists = [...specialPlaylists, savedTracks]

export const tableKeys = [
  'download',
  'order',
  'artists',
  'albumName',
  ..._stats.filter((s) => s !== 'order'),
]

const tableKeyToObjectKey = (tableKey, song) => {
  if (tableKey === 'artists') {
    return 'artists[0].name'
  }
  if (tableKey === 'albumName') {
    return 'album.name'
  } else if (get(song, '[0].audioFeatures', {}).hasOwnProperty(tableKey)) {
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
  const [songsWithFeatures, setSongWithFeatures] = useState([])
  const [currentSort, setCurrentSort] = useState('')
  const didMergeTrack = React.useRef(false)
  const [minMax, setMinMax] = useState([0, 0])

  useEffect(() => {
    const getTrackByPlaylist = async () => {
      setLoading(true)
      setSongWithFeatures(await getSongsWithAudioFeatures(playlistId))
      setLoading(false)
    }
    getTrackByPlaylist()
  }, [])

  useEffect(() => {
    if (currentSort && songsWithFeatures.length) {
      const [tableKey, direction] = currentSort.split(' - ')
      sortTracks(tableKey, direction)
      didMergeTrack.current = false
    }
  }, [currentSort, songsWithFeatures.length])

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

  const sortTracks = useCallback(
    (tableKey, direction = 'ASC') => {
      if (!(tableKey && direction)) {
        return
      }
      const newSort = `${tableKey} - ${direction}`
      setCurrentSort(newSort)
      const key = tableKeyToObjectKey(tableKey, songsWithFeatures)

      const keyType = typeof get(songsWithFeatures[0], key)
      if (get(songsWithFeatures[0], key) === undefined) return

      if (keyType === 'string') {
        const sorted =
          direction === 'ASC'
            ? songsWithFeatures.sort((a, b) =>
                get(a, key).localeCompare(get(b, key))
              )
            : songsWithFeatures
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
        const sorted = songsWithFeatures.sort((a, b) => {
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
    },
    [songsWithFeatures]
  )

  const uris = songsWithFeatures.map(({ uri }) => uri)
  const includedUris = songsWithFeatures
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
    const key = tableKeyToObjectKey(tableKey, songsWithFeatures)
    setSongWithFeatures((prev) => {
      prev.map((track) => {
        const field = get(track, key)
        track.include = field <= max && field >= min
      })
      return [...prev]
    })
  }
  return [
    songsWithFeatures,
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
  const [whiteList, setWhiteList] = useState(
    new Set(whiteStatsList.filter((s) => tableKeys.includes(s)))
  )

  const TableSettings = ({ hide, children }) => {
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
        {children}
      </form>
    )
  }
  return [[...whiteList], TableSettings]
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

const useMergePlaylist = (
  { mergeMoreTracks, currentPlaylistId },
  playlists
) => {
  const [mergeLoadingStatus, setLoadingMerge] = useState('')
  const [mergedPlaylistIds, setMergedPlaylistIds] = useState(
    [currentPlaylistId].filter(Boolean)
  )
  const [mergedPlaylistNames, setMergedPlaylistNames] = useState([])
  const handleMergeNewPlaylist = async (playlistId) => {
    setLoadingMerge('🤞')
    const moreTracks = await getSongsWithAudioFeatures(playlistId)
    mergeMoreTracks(moreTracks)
    setMergedPlaylistIds((prev) => [...prev, playlistId])
    const mergedPl = playlists.find((pl) => pl.id === playlistId)
    setMergedPlaylistNames((prev) => [...prev, mergedPl.name])
    setLoadingMerge(moreTracks.length ? '👍' : '👎')
    setTimeout(() => {
      setLoadingMerge('')
    }, 3000)
  }

  return {
    mergeLoadingStatus,
    mergedPlaylistIds,
    mergedPlaylistNames,
    handleMergeNewPlaylist,
  }
}

const preferedStatKeys = JSON.parse(
  localStorage.getItem('preferedStatKeys') ||
    '["popularity", "danceability", "tempo"]'
)

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

  const [stats, TableSettings] = useStatKeys(preferedStatKeys)

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
    mergedPlaylistNames,
    handleMergeNewPlaylist,
  } = useMergePlaylist(
    {
      mergeMoreTracks,
      currentPlaylistId: playlistId,
    },
    playlists
  )

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
          label={'Select a playlist'}
          onChange={handleChangePlaylist}
          playlists={playlists}
          currentPlaylistId={playlistId}
        />
      </div>
      <div className="analysis-playlists">
        <CurrentPlaylist currentPlaylist={currentPlaylist} />
      </div>
      <div className="analysis-playlists">
        {currentPlaylist && (
          <>
            <SavePlaylist
              user_id={userId}
              currentPlaylist={currentPlaylist}
              currentSort={currentSort}
              createPlaylist={handleCreatePlaylist}
              description={currentPlaylist.description}
              mergedPlaylistNames={mergedPlaylistNames}
            />
            <UserPlaylistsSelect
              label={'Merge another playlist'}
              onChange={handleMergeNewPlaylist}
              playlists={playlists.filter(
                ({ id }) => !mergedPlaylistIds.includes(id)
              )}
              currentPlaylistId={''}
              loadingStatus={mergeLoadingStatus}
            />
          </>
        )}
      </div>
      <div className="analysis-playlists">
        <TableSettings hide={isHidden}>
          <select value={currentSortValue} onChange={handleSort}>
            {tableKeys.map((key) => (
              <>
                <option value={`${key}-ASC`}>{key} - ASC</option>
                <option value={`${key}-DESC`}>{key} - DESC</option>
              </>
            ))}
          </select>
        </TableSettings>
        {min + max !== 0 && (
          <Range min={min} max={max} onRangeChange={checkByRange} />
        )}

        <div>
          <button className="s-submit grey" onClick={toggleHidden}>
            Settings (audio features)
          </button>
        </div>
      </div>
      <FetchProvider>
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
      </FetchProvider>
    </>
  )
})

export default withCurrentSong(AnalysisPlaylistsPage)
