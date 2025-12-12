import { useEffect, useState, useContext, useRef } from 'react'
import { getAlbumById, getArtists, controls } from 'api/spotify'
import { CurrentPlayingContext } from '../context'
import { GlobalContext } from '../globalContext'

const useSkippedIdsCount = () => {
  const didMount = useRef(false)
  const [skippedIds, setSkippedIds] = useState(
    JSON.parse(localStorage.skippedIds || '{}')
  )

  const addSkip = (skippedId) => {
    setSkippedIds((prev) => {
      return {
        ...prev,
        [skippedId]: (prev[skippedId] || 0) + 1,
      }
    })
  }
  useEffect(() => {
    if (didMount.current)
      localStorage.setItem('skippedIds', JSON.stringify(skippedIds))
    didMount.current = true
  }, [skippedIds])

  return { skippedIds, addSkip }
}
export const useSkipTrack = () => {
  const currentTrack = useContext(CurrentPlayingContext)
  const [
    {
      skipList,
      visible: { skipList: isVisible },
    },
    dispatch,
  ] = useContext(GlobalContext)
  const addToSkipList = (skipType, id) => {
    dispatch({
      type: 'skipList/add',
      skipType,
      id,
    })
  }
  const removeFromSkipList = (skipType, id) => {
    dispatch({
      type: 'skipList/delete',
      skipType,
      id,
    })
  }
  const toggleSkipList = (active) => {
    dispatch({
      type: 'skipList/active',
      active,
    })
  }
  const toggleVisiblitySkipList = (active) => {
    dispatch({
      type: 'visible/toggle-skipList',
    })
  }

  const { item } = currentTrack

  const [currentGenres, setCurrentGenres] = useState([])

  const getGenres = async () => {
    const artistsIds = item.artists.map(({ id }) => id).toString()
    // genres exist on albums but always seem to be empty
    const album = await getAlbumById(item.album.id)
    // genres on artists seems reliable though
    const { artists } = await getArtists(artistsIds)

    const genres = album.genres.length
      ? album.genres
      : artists.flatMap((artist) => artist.genres || [])
    setCurrentGenres(genres)
    return genres
  }

  const { addSkip } = useSkippedIdsCount()
  /**
   * skips the track when its included in the block list
   */
  const skipTrack = async (skipList, item, currentGenres) => {
    const toSkipId = (a, b) => [a, b].join(' - ')

    const trackSkipId = toSkipId(item.id, item.name)
    const artistsSkipIds = item.artists.map((artist) =>
      toSkipId(artist.id, artist.name)
    )
    const genreSkips = currentGenres.map((g) => toSkipId(g, g))

    let skippedId = ''
    const setSkippedId = (id) => {
      skippedId = id
      return true
    }

    if (
      skipList.active &&
      ((skipList.tracks.has(trackSkipId) && setSkippedId(trackSkipId)) ||
        artistsSkipIds.some(
          (id) => skipList.artists.has(id) && setSkippedId(id)
        ) ||
        genreSkips.some((id) => skipList.genres.has(id) && setSkippedId(id)))
    ) {
      addSkip(skippedId)
      await controls('next')
    }
  }

  useEffect(() => {
    if (!item.id) return
    getGenres().then((genres) => {
      skipTrack(skipList, item, genres)
    })
  }, [item.id])

  return {
    currentTrack,
    genres: currentGenres,
    artists: item.artists,
    track: {
      name: item.name,
      id: item.id,
    },
    addToSkipList,
    removeFromSkipList,
    toggleSkipList,
    toggleVisiblitySkipList,
    skipList,
    isVisible,
  }
}
