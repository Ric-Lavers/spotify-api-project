import { connectToDatabase } from '../connectToDB'
import { TrackObjectFull, UserObjectPrivate } from '../../types/spotify-api'

const USER_LIMIT = 25
type spotify_id = string
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
  user_ids: spotify_id[]
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
    user_ids: {
      $in: spotify_user_id,
    },
  }).select(['_id', 'description', 'title', 'created_at', 'user_ids', 'users'])

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
  const user: TrackObjectFull[] = body.user
  // create top table instance
  const newTopTablePlaylist = new TopTracksPlaylist({
    ...body,
    user_ids: [actualUserId],
    users: [user],
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
  Math.round((rank.reduce((a, c) => a + c, 0) / count) * 10) / 10

export const addTracksToTopTablePlaylist = async (
  topTablePlaylistId,
  userId: string,
  trackIds: string[],
  user: UserObjectPrivate
) => {
  //TODO
  const actualUserId = userId
    .replace('-short_term', '')
    .replace('-medium_term', '')
    .replace('-long_term', '')
  const list = await getTopTablePlaylistById(topTablePlaylistId)
  // console.log('enforcing UserLimit of ', USER_LIMIT)

  // enforceUserLimit(list.users, list.user_ids)
  // if (list.user_ids.some((u: spotify_id) => u === userId)) {
  //   //! THIS will never hit as user is concated values   `{spotify_id}-{time_range}`
  //   return list
  // }
  // //TODO we dont want to add users more than once.

  const user_ = await list.users.find(({ id }) => id === actualUserId)

  if (user_) {
    user_.updated_at = Date.now()
  } else {
    list.user_ids.push(actualUserId)
    list.users.push(user)
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
  trackIds: string[],
  user: UserObjectPrivate
) => {
  const list = await getTopTablePlaylistById(topTablePlaylistId)

  const listWithoutUserTracks = removeUserTracks(list, trackIds, userId)
  await listWithoutUserTracks.save()

  const result = await addTracksToTopTablePlaylist(
    topTablePlaylistId,
    userId,
    trackIds,
    user
  )

  return result
}

/**
 * removes user_id from the track, resets rank score and count,
 * then removes any tracks without any users.
 *
 * @returns DbPartyPlaylist
 */
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

/**
 * with so much happening on the front end we want to prevent large parties,
 * as it will crash their browser.
 *
 */
export function enforceUserLimit(
  users: UserObjectPrivate[] = [],
  users_ids: string[] = []
) {
  if ((users.length >= USER_LIMIT && users_ids.length) >= USER_LIMIT) {
    console.log('enforceUserLimit')
    console.log('users_ids.: ', users_ids)
    console.log('users.: ', users)
    console.log('__________')
    throw new Error(`party is at user capacity limit: ${USER_LIMIT}`)
  }
}
