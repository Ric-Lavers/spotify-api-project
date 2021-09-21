import { Types } from 'mongoose'
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
  const { TopTracksPlaylist, Update } = connectToDatabase()
  let data

  await TopTracksPlaylist.findById(topTablePlaylistId)
    .populate('users')
    .then((playlist) => {
      playlist.tracks.sort((a, b) => a.score - b.score)

      data = playlist
    })
  const lastUpdates = await Update.find({ playlist: data }).then((updates) =>
    (updates || []).reduce((a, { user, updated_at }) => {
      a[user] = updated_at
      return a
    }, {})
  )
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
      updated_at: lastUpdates[_id] || updated_at,
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
  const { TopTracksPlaylist, User } = connectToDatabase()

  let playlist = await TopTracksPlaylist.findOne({
    _id: playlist_id,
  })
  const currentUser = await User.findOne({ id: spotify_user_id })
  const spotify_playlist_ids = currentUser.spotify_playlist_id || {}
  spotify_playlist_ids[playlist_id] = spotify_playlist_id

  await User.findOneAndUpdate(
    { id: spotify_user_id },
    { spotify_playlist_id: spotify_playlist_ids }
  )

  return playlist
}

/**
 * This are just playlists that are created using top track data.
 */
export const createNewTopTablePlaylist = async (userId: string, body) => {
  const { TopTracksPlaylist, User, Update } = connectToDatabase()
  //TODO
  const actualUserId = userId
    .replace('-short_term', '')
    .replace('-medium_term', '')
    .replace('-long_term', '')

  const tracks: TrackObjectWithFeatures[] = body.tracks

  const existingUser = await User.findOne({ id: body.user.id })
  const user = existingUser ? existingUser : new User(body.user)

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

  const update = await Update.create({
    user,
    playlist: newTopTablePlaylist,
  })

  const result = await newTopTablePlaylist.save()
  await user.save()
  await update.save()
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
  const { User, Update } = connectToDatabase()
  const list = await getTopTablePlaylistById(topTablePlaylistId)

  if (list.user_ids.some((u) => u === userId)) {
    return list
  }

  const u = await User.findOneAndUpdate({ id: user.id }, user, { upsert: true })
  const userExists = !!list.users.find(({ id }) => id === user.id)

  if (userExists) {
    await Update.updateOne(
      {
        user: Types.ObjectId(u._id),
        playlist: list,
      },
      {
        updated_at: new Date(),
      }
    )
  } else {
    list.user_ids.push(user.id)
    list.users.push(u)
    await Update.create({
      user: u,
      playlist: list,
    })
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
