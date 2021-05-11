import { getAlbumById, getArtists } from 'api/spotify'
import { useEffect, useState } from 'react'

export const useSkipTrack = async (currentSong) => {
  const { item } = currentSong

  const [currentGenres, setCurrentGenres] = useState([])

  const getGenres = async () => {
    const artistsIds = item.artists.map(({ id }) => id).toString()
    // genres exist on albums but always seem to be empty
    const album = await getAlbumById(item.album.id)
    // genres on artists is pretty good though
    const { artists } = await getArtists(artistsIds)

    const genres = album.genres.length
      ? album.genres
      : artists.flatMap((artist) => artist.genres || [])

    setCurrentGenres(genres)
  }

  useEffect(() => {
    if (!item.id) return
    getGenres()
  }, [item.id])
}
