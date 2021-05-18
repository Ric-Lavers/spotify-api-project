import { useEffect, useState, useContext } from 'react'
import { getAlbumById, getArtists, controls } from 'api/spotify'
import { CurrentPlayingContext } from '../context'
import { GlobalContext } from '../globalContext'

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
    if (
      skipList.active &&
      (skipList.tracks.has(trackSkipId) ||
        artistsSkipIds.some((id) => skipList.artists.has(id)) ||
        genreSkips.some((id) => skipList.genres.has(id)))
    ) {
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
