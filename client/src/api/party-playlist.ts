import { serverFetch } from './utils'
import { getHeapsTracks, getHeapsAudioFeatures } from './spotify'
import { TrackObjectFull, AudioFeaturesObject } from '../types/spotify-api'

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
  spotify_user_id: string,
  topTablePlaylistId: string,
  topTrackIds: string[],
  time_range: TopTimeRange | string = ''
) => {
  try {
    const searchParams = new URLSearchParams({ spotify_user_id, time_range })
    let data = await serverFetch(
      `playlists/${topTablePlaylistId}/add?${searchParams.toString()}`,
      {
        method: 'POST',
        body: JSON.stringify({
          tracks: topTrackIds,
        }),
      }
    )

    return data
  } catch (error) {
    console.error(error.message)
    return []
  }
}

export const createPartyPlaylist = async (
  spotify_user_id: string,
  body: {
    title: string
    description?: string
    isPublic?: boolean
    collaborative?: boolean
  },
  topTrackIds: string[],
  time_range: TopTimeRange | string = ''
) => {
  const searchParams = new URLSearchParams({ spotify_user_id, time_range })
  let data = await serverFetch(`playlists/create?${searchParams.toString()}`, {
    method: 'POST',
    body: JSON.stringify({
      ...body,
      tracks: topTrackIds,
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
  playlistId: string
): Promise<{
  uris: string[]
  tracks: PartySong[]
}> => {
  try {
    let data = await serverFetch(`playlists/${playlistId}`)
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
  } catch (error) {}
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
