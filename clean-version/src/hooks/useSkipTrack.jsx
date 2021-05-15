import { useEffect, useState, useMemo } from 'react'
import { getAlbumById, getArtists } from 'api/spotify'
import { combineArtists } from '../helpers'

export const useSkipTrack = (currentTrack) => {
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
  }

  // const artists = useMemo(() => combineArtists(item.artists), [item.artists])

  useEffect(() => {
    if (!item.id) return
    getGenres()
  }, [item.id])

  return {
    genres: currentGenres,
    artists: item.artists,
    track: {
      name: item.name,
      id: item.id,
    },
  }
}
