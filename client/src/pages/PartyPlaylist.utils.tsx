import { useEffect, useState } from 'react'
import { TrackObjectFull } from '../types/spotify-api'
import { getAllPlaylistsTracks } from '../api/spotify'
import { addToPartyPlaylist, createPartyPlaylist } from '../api/party-playlist'
import { top_time_range } from '../constants'

export const useTopTracks = (
  userId: string
): {
  topTracks: {
    short_term: TrackObjectFull[]
    medium_term: TrackObjectFull[]
    long_term: TrackObjectFull[]
  }
  loading: boolean
} => {
  const [loading, setLoading] = useState(false)
  const [topTracks, setTopTracks] = useState({
    short_term: [],
    medium_term: [],
    long_term: [],
  })

  const getTopTracks = async () => {
    setLoading(true)
    const [
      { items: short_term },
      { items: medium_term },
      { items: long_term },
    ] = await Promise.all(
      top_time_range.map(({ value: timeRange }) =>
        getAllPlaylistsTracks(timeRange)
      )
    )
    const flattenTrack = (track: { track: TrackObjectFull }) => track.track

    setTopTracks({
      short_term: short_term.map(flattenTrack),
      medium_term: medium_term.map(flattenTrack),
      long_term: long_term.map(flattenTrack),
    })
    setLoading(false)
  }
  useEffect(() => {
    if (userId) {
      getTopTracks()
    }
  }, [userId])

  return { topTracks, loading }
}

interface AllTopTracks {
  short_term: string[]
  medium_term: string[]
  long_term: string[]
}

export const createTopTracksPlaylist = async (
  spotify_user_id: string,
  body: {
    title: string
    description?: string
    isPublic?: boolean
    collaborative?: boolean
  },
  allTopTracksIds: AllTopTracks
) => {
  try {
    const { _id: topTablePlaylistId } = await createPartyPlaylist(
      spotify_user_id,
      body,
      allTopTracksIds.short_term,
      'short_term'
    )
    await addToPartyPlaylist(
      spotify_user_id,
      topTablePlaylistId,
      allTopTracksIds.medium_term,
      'medium_term'
    )
    const data = await addToPartyPlaylist(
      spotify_user_id,
      topTablePlaylistId,
      allTopTracksIds.long_term,
      'long_term'
    )
    return data
  } catch (error) {
    console.log('error creating top table', error)
  }
}

export const addTopTracksToPlaylist = async (
  spotify_user_id: string,
  topTablePlaylistId: string,
  allTopTracksIds: AllTopTracks
) => {
  try {
    await addToPartyPlaylist(
      spotify_user_id,
      topTablePlaylistId,
      allTopTracksIds.short_term,
      'short_term'
    )
    await addToPartyPlaylist(
      spotify_user_id,
      topTablePlaylistId,
      allTopTracksIds.medium_term,
      'medium_term'
    )
    const data = await addToPartyPlaylist(
      spotify_user_id,
      topTablePlaylistId,
      allTopTracksIds.long_term,
      'long_term'
    )
    return data
  } catch (error) {
    console.log('error creating top table', error)
  }
}

export const getTopTrackIds = (tracks: {
  short_term: TrackObjectFull[]
  medium_term: TrackObjectFull[]
  long_term: TrackObjectFull[]
}): {
  short_term: string[]
  medium_term: string[]
  long_term: string[]
} => {
  const getId = (track: TrackObjectFull) => track.id
  return {
    short_term: tracks.short_term.map(getId),
    medium_term: tracks.medium_term.map(getId),
    long_term: tracks.long_term.map(getId),
  }
}

export const formatUserPlaylists = (
  playlists: {
    _id: string
    created_at: string
    description: string
    title: string
    user_ids: string[]
  }[]
): {
  value: string
  label: string
}[] => playlists.map(({ _id, title }) => ({ value: _id, label: title }))
