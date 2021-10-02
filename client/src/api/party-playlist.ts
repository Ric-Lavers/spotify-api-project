import { UserObjectPrivate } from '../types/spotify-api'
import { serverFetch } from './utils'
import { getHeapsTracks, getHeapsAudioFeatures } from './spotify'
import { TrackObjectFull, AudioFeaturesObject } from '../types/spotify-api'
import { TrackObjectWithFeatures } from 'pages/PartyPlaylist.utils'

export enum TopTimeRange {
  SHORT_TERM = 'short_term',
  MEDIUM_TERM = 'medium_term',
  LONG_TERM = 'long_term',
}
export const getUserPartyPlaylists = async (user_id: string) => {
  try {
    let data = await serverFetch(`playlists/user/${user_id}`)

    return data
  } catch (error) {
    console.error(error.message)
    return []
  }
}

export const addToPartyPlaylist = async (
  user: UserObjectPrivate,
  topTablePlaylistId: string,
  topTracks: TrackObjectWithFeatures[],
  time_range: TopTimeRange | string = ''
) => {
  try {
    const searchParams = new URLSearchParams({
      spotify_user_id: user.id,
      time_range,
    })
    let data = await serverFetch(
      `playlists/${topTablePlaylistId}/add?${searchParams.toString()}`,
      {
        method: 'POST',
        body: JSON.stringify({
          tracks: topTracks,
          user,
        }),
      }
    )

    return data
  } catch (error) {
    console.error(error.message)
    return []
  }
}

export const updatePartyPlaylist = async (
  user: UserObjectPrivate,
  topTablePlaylistId: string,
  topTracks: TrackObjectWithFeatures[],
  time_range: TopTimeRange | string = ''
) => {
  try {
    const searchParams = new URLSearchParams({
      spotify_user_id: user.id,
      time_range,
    })
    let data = await serverFetch(
      `playlists/${topTablePlaylistId}/update?${searchParams.toString()}`,
      {
        method: 'POST',
        body: JSON.stringify({
          tracks: topTracks,
          user,
        }),
      }
    )

    return data
  } catch (error) {
    console.error(error.message)
    return null
  }
}

export const createPartyPlaylist = async (
  user: UserObjectPrivate,
  body: {
    title: string
    description?: string
    isPublic?: boolean
    collaborative?: boolean
  },
  topTracks: TrackObjectWithFeatures[],
  time_range: TopTimeRange | string = ''
) => {
  const searchParams = new URLSearchParams({
    spotify_user_id: user.id,
    time_range,
  })
  let data = await serverFetch(`playlists/create?${searchParams.toString()}`, {
    method: 'POST',
    body: JSON.stringify({
      ...body,
      tracks: topTracks,
      user,
    }),
  })

  return data
}
interface Song extends TrackObjectFull {
  audioFeatures: AudioFeaturesObject
  include: boolean
}
interface PartySong extends Song {
  custom: {
    count: number
    score: number
    rank: number[]
    user_ids: string[]
  }
}

export const getPartyPlaylist = async (
  playlistId: string,
  options?: {
    sort?: string
    direction?: 'acs' | 'desc' | 1 | 0
    limit?: number
  }
): Promise<{
  uris: string[]
  tracks: PartySong[]
}> => {
  //@ts-ignore
  const searchParams = new URLSearchParams(options).toString()
  console.log(options, searchParams)
  let data = await serverFetch(`playlists/${playlistId}?${searchParams}`)
  const trackIds = data.tracks.map(({ id }) => id)
  const [{ tracks }, audioFeatures] = await Promise.all([
    getHeapsTracks(trackIds),
    getHeapsAudioFeatures(trackIds),
  ])

  return {
    ...data,
    uris: tracks.map(({ uri }) => uri),
    tracks: data.tracks.map((t, i) => ({
      ...tracks[i],
      audioFeatures: audioFeatures[i],
      include: true,
      custom: (() => {
        const { count, score, rank, user_ids } = t
        return { count, score, rank, user_ids }
      })(),
    })),
  }
}

export const getUserTopTracks = async (user_id: string) => {
  try {
    let data = await serverFetch(
      `me/getUserTopTracks?spotify_user_id=${user_id}`
    )
    return data
  } catch (error) {
    console.log(error.message)
    return []
  }
}

export const saveSpotifyPlaylistId = async (
  user_id: string,
  playlist_id: string,
  spotify_playlist_id: string
) => {
  const data = await serverFetch(`playlists/user/spotifyplaylistId/add`, {
    method: 'POST',
    body: JSON.stringify({
      user_id,
      playlist_id,
      spotify_playlist_id,
    }),
  })
  return data
}
