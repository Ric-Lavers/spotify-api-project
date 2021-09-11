import { connectToDatabase } from '../connectToDB'
import {
  TrackObjectFull,
  UserObjectPrivate,
  AudioFeaturesObject,
} from '../../types/spotify-api'
export interface TrackObjectWithFeatures extends TrackObjectFull {
  audioFeatures: AudioFeaturesObject[]
}

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

export const getTopTablePlaylistById = async (topTablePlaylistId: string) => {
  const { TopTracksPlaylist } = connectToDatabase()
  let data
  await TopTracksPlaylist.findById(topTablePlaylistId).then((playlist) => {
    playlist.tracks.sort((a, b) => a.score - b.score)

    data = playlist
  })

  data.users.filter(Boolean).forEach((user, j) => {
    const {
      created_at,
      updated_at,
      display_name,
      id,
      images,
      _id,
      spotify_playlist_id,
    } = user

    data.users[j] = {
      created_at,
      updated_at,
      display_name,
      id,
      images,
      _id,
      spotify_playlist_id,
    }
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

  usersLists.forEach((list, i) => {
    list.users.filter(Boolean).forEach((user, j) => {
      const {
        created_at,
        updated_at,
        display_name,
        id,
        images,
        _id,
        spotify_playlist_id,
      } = user

      usersLists[i].users[j] = {
        created_at,
        updated_at,
        display_name,
        id,
        images,
        _id,
        spotify_playlist_id,
      }
    })
  })

  return usersLists
}
export const saveSpotifyPlaylistId = async (
  spotify_user_id: string,
  playlist_id: string,
  spotify_playlist_id: string
) => {
  const { TopTracksPlaylist } = connectToDatabase()

  let playlist = await TopTracksPlaylist.findOne({
    _id: playlist_id,
  })
  const currentUser = playlist.users.find((u) => u.id === spotify_user_id)
  currentUser.spotify_playlist_id = spotify_playlist_id
  await playlist.save()

  return playlist
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

  const tracks: TrackObjectWithFeatures[] = body.tracks
  const user: TrackObjectFull[] = body.user

  // create top table instance
  const newTopTablePlaylist = new TopTracksPlaylist({
    ...body,
    user_ids: [actualUserId],
    users: [user],
    tracks: tracks.map(({ id, audioFeatures }, rank) => ({
      id,
      audioFeatures,
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
  tracks: TrackObjectWithFeatures[],
  user: UserObjectPrivate
) => {
  //TODO
  const actualUserId = userId
    .replace('-short_term', '')
    .replace('-medium_term', '')
    .replace('-long_term', '')
  const list = await getTopTablePlaylistById(topTablePlaylistId)

  if (list.user_ids.some((u) => u === userId)) {
    return list
  }

  const user_ = await list.users.find(({ id }) => id === actualUserId)

  if (user_) {
    const now = Date.now()
    user_.updated_at = now
    list.updated_at = now
  } else {
    list.user_ids.push(actualUserId)
    list.users.push(user)
  }

  tracks
    .map(({ id, audioFeatures }, rank) => ({
      id,
      audioFeatures,
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
  tracks: TrackObjectWithFeatures[],
  user: UserObjectPrivate
) => {
  const list = await getTopTablePlaylistById(topTablePlaylistId)

  const listWithoutUserTracks = removeUserTracks(
    list,
    tracks.map(({ id }) => id),
    userId
  )

  await listWithoutUserTracks.save()
  const result = await addTracksToTopTablePlaylist(
    topTablePlaylistId,
    userId,
    tracks,
    user
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
