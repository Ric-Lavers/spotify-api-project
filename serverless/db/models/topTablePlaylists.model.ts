import { connectToDatabase } from '../connectToDB'
import { TrackObjectFull } from '../../types/spotify-api'

interface ListTrack {
  //spotify track id
  id: string
  // number of entries
  count: number
  // list of position on user top list
  rank: number[]
  // rank divided by count
  score: number
  // list of user ids
  user_ids: string[]
}
interface PrivateUserObject {
  id: string
  birthdate: string
  country: string
  display_name: string
  email: string
  explicit_content: {
    filter_enabled: boolean
    filter_locked: boolean
  }
  external_urls: { [key: string]: string }
  followers: {
    href: null | string
    total: number
  }
  href: string
  images: {
    height: number | null
    width: number | null
    url: string
  }[]
  product: string
  type: string
  uri: string
}

export const getTopTablePlaylistById = async (topTablePlaylistId: string) => {
  const { TopTracksPlaylist } = connectToDatabase()
  let data
  await TopTracksPlaylist.findById(topTablePlaylistId).then((playlist) => {
    playlist.tracks.sort((a, b) => a.score - b.score)

    data = playlist
  })

  return data
}

export const getTopTablePlaylistsByUserIds = async (
  spotify_user_id: string
) => {
  const { TopTracksPlaylist } = connectToDatabase()

  let usersLists = await TopTracksPlaylist.find({
    user_iuserSchemads: {
      $in: spotify_user_id,
    },
  }).select(['_id', 'description', 'title', 'created_at', 'user_ids'])

  return usersLists
}

/**
 * This are just playlists that are created using top track data.
 */
export const createNewTopTablePlaylist = async (userId: string, body) => {
  const { TopTracksPlaylist } = connectToDatabase()
  //TODO
  const actualUserId = userId
    .replace('-short_term', '')
    .replace('-medium_term', '')
    .replace('-long_term', '')

  const tracks: TrackObjectFull[] = body.tracks
  // create top table instance
  const newTopTablePlaylist = new TopTracksPlaylist({
    user_ids: [actualUserId],
    ...body,
    tracks: tracks.map((spotify_id, rank) => ({
      id: spotify_id,
      rank: [rank + 1],
      score: rank + 1,
      user_ids: [userId],
    })),
  })

  const result = await newTopTablePlaylist.save()

  return result
}

const calculateScore = (rank: number[], count) =>
  Math.round((rank.reduce((a, c) => a + c, 0) / count) * 1000) / 1000

export const addTracksToTopTablePlaylist = async (
  topTablePlaylistId,
  userId: string,
  trackIds: string[]
) => {
  //TODO
  const actualUserId = userId
    .replace('-short_term', '')
    .replace('-medium_term', '')
    .replace('-long_term', '')
  const list = await getTopTablePlaylistById(topTablePlaylistId)

  if (list.user_ids.some((u) => u === userId)) return list

  if (!list.user_ids.some((id) => id === actualUserId)) {
    list.user_ids.push(actualUserId)
  }
  trackIds
    .map((spotify_id, rank) => ({
      id: spotify_id,
      rank: [rank + 1],
      score: rank + 1,
      user_ids: [userId],
    }))
    .forEach((t, rank) => {
      const exists = list.tracks.find((track) => track.id === t.id)
      if (exists) {
        exists.count = exists.count + 1
        exists.rank.push(rank + 1)
        exists.score = calculateScore(exists.rank, exists.count)
        exists.user_ids.push(userId)
      } else {
        list.tracks.push(t)
      }
    })
  await list.save()

  const result = await getTopTablePlaylistById(topTablePlaylistId)
  return result
}

export const updateTracksToTopTablePlaylist = async (
  topTablePlaylistId,
  userId: string,
  trackIds: string[]
) => {
  const list = await getTopTablePlaylistById(topTablePlaylistId)

  const listWithoutUserTracks = removeUserTracks(list, trackIds, userId)
  console.log('listWithoutUserTracks', listWithoutUserTracks.tracks)

  await listWithoutUserTracks.save()
  const result = await addTracksToTopTablePlaylist(
    topTablePlaylistId,
    userId,
    trackIds
  )

  return result
}

function removeUserTracks(list, trackIds, userId) {
  list.tracks = list.tracks
    .map((listTrack) => {
      const trackId = trackIds.find((id) => id === listTrack.id)
      const index = listTrack.user_ids.indexOf(userId)

      if (!trackId || index === -1) {
        return listTrack
      }

      listTrack.user_ids.splice(index, 1)
      listTrack.rank.splice(index, 1)
      listTrack.score = calculateScore(listTrack.rank, listTrack.count)
      listTrack.count = listTrack.rank.length

      return listTrack
    })
    .filter(({ user_ids }) => user_ids.length)

  return list
}
