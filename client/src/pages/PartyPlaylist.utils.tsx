import { useEffect, useState } from 'react'
import {
  TrackObjectFull,
  UserObjectPrivate,
  MultipleAudioFeaturesResponse,
} from '../types/spotify-api'
import { getAllPlaylistsTracks } from '../api/spotify'
import {
  addToPartyPlaylist,
  updatePartyPlaylist,
  createPartyPlaylist,
} from '../api/party-playlist'
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
  const [loading, setLoading] = useState(true)
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
        getAllPlaylistsTracks(timeRange, true, true)
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

export interface TrackObjectWithFeatures
  extends TrackObjectFull,
    MultipleAudioFeaturesResponse {}

interface AllTopTracks {
  short_term: TrackObjectWithFeatures[]
  medium_term: TrackObjectWithFeatures[]
  long_term: TrackObjectWithFeatures[]
}
interface AllTopTracksId {
  short_term: string[]
  medium_term: string[]
  long_term: string[]
}

export const createTopTracksPlaylist = async (
  user: UserObjectPrivate,
  body: {
    title: string
    description?: string
    isPublic?: boolean
    collaborative?: boolean
  },
  allTopTracks: AllTopTracks
) => {
  try {
    // const { _id: topTablePlaylistId } =
    return await createPartyPlaylist(
      user,
      body,
      allTopTracks.short_term,
      'short_term'
    )
    // await addToPartyPlaylist(
    //   user,
    //   topTablePlaylistId,
    //   allTopTracks.medium_term,
    //   'medium_term'
    // )
    // const data = await addToPartyPlaylist(
    //   user,
    //   topTablePlaylistId,
    //   allTopTracks.long_term,
    //   'long_term'
    // )
    // return data
  } catch (error) {
    console.log('error creating top table', error)
  }
}

export const addTopTracksToPlaylist = async (
  user: UserObjectPrivate,
  topTablePlaylistId: string,
  allTopTracks: AllTopTracks
) => {
  try {
    return await addToPartyPlaylist(
      user,
      topTablePlaylistId,
      allTopTracks.short_term,
      'short_term'
    )
    // await addToPartyPlaylist(
    //   user,
    //   topTablePlaylistId,
    //   allTopTracks.medium_term,
    //   'medium_term'
    // )
    const data = await addToPartyPlaylist(
      user,
      topTablePlaylistId,
      allTopTracks.long_term,
      'long_term'
    )
    return data
  } catch (error) {
    console.log('error adding top table', error)
  }
}
export const updateTopTracksPlaylist = async (
  user: UserObjectPrivate,
  topTablePlaylistId: string,
  allTopTracks: AllTopTracks
) => {
  try {
    return await updatePartyPlaylist(
      user,
      topTablePlaylistId,
      allTopTracks.short_term,
      'short_term'
    )
    // await updatePartyPlaylist(
    //   user,
    //   topTablePlaylistId,
    //   allTopTracks.medium_term,
    //   'medium_term'
    // )
    // const data = await updatePartyPlaylist(
    //   user,
    //   topTablePlaylistId,
    //   allTopTracks.long_term,
    //   'long_term'
    // )
    // return data
  } catch (error) {
    console.log('error updating top table', error)
  }
}

export const getTopTrackIds = (tracks: AllTopTracks): AllTopTracksId => {
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
    created_at: Date
    description: string
    title: string
    user_ids: string[]
  }[]
): {
  value: string
  label: string
}[] =>
  playlists
    //@ts-ignore
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(({ _id, title }) => ({ value: _id, label: title }))
