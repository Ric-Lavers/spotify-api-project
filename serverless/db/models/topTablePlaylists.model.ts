import { Types, ObjectId } from 'mongoose'
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
/**
 * used for populating existing playlists dropdown
 */
export const getTopTablePlaylistsByUserId = async (spotify_user_id: string) => {
  const { TopTracksPlaylist } = connectToDatabase()

  let usersLists = await TopTracksPlaylist.find(
    {
      user_ids: {
        $in: spotify_user_id,
      },
    },
    '_id description title created_at user_ids users'
  ).populate('users', 'created_at updated_at display_name id images ')

  //TODO use a query
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

/**
 * sort the playlist
 * initially set as with tracks with most users on top
 */
export const getTopTablePlaylistById = async (
  topTablePlaylistId: string,
  sort?: string,
  direction: 'asc' | 'desc' | number = 1,
  limit: number = 100
) => {
  const { TopTracksPlaylist, Update, Track } = connectToDatabase()
  let data

  await TopTracksPlaylist.findById(topTablePlaylistId)
    .populate('users')
    .populate('tracks')
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

  // const aggregated = await Track.aggregate([
  //   { $match: { playlistId: topTablePlaylistId } },
  //   { "$project": {
  //     user_ids: 1,
  //     rank: 1,
  //     score: 1,
  //     count: 1,
  //     time_range: 1,
  //     id: 1,
  //     audioFeatures: 1,
  //     "length": { "$size": "$user_ids" }
  //   } }

  // ])
  // console.log({ aggregated })

  const tracks = await Track.find(
    { playlistId: topTablePlaylistId },
    '-_id -playlistId'
  )
    .sort(
      sort
        ? { [sort]: direction }
        : [
            ['count', -1],
            ['score', 1],
            // ['audioFeatures.popularity', 1],
          ]
    )
    .limit(limit)
  data.tracks = tracks

  return data
}

/**
 * saves the playlist to spotify
 */
export const saveSpotifyPlaylistId = async (
  spotify_user_id: string,
  playlist_id: string,
  spotify_playlist_id: string
) => {
  const { TopTracksPlaylist, User } = connectToDatabase()

  let playlist = await TopTracksPlaylist.findOne({
    _id: playlist_id,
  })
    .populate('users')
    .populate('tracks')
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
 * The initial party playlist created
 */
export const createNewTopTablePlaylist = async (userId: string, body) => {
  const { TopTracksPlaylist, User, Update, Track } = connectToDatabase()

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
  })
  newTopTablePlaylist.tracks = await Promise.all(
    tracks.map(async ({ id, audioFeatures, popularity }, rank) => {
      const t = new Track({
        playlistId: newTopTablePlaylist._id,
        id,
        audioFeatures: { popularity, ...audioFeatures },
        rank: [rank + 1],
        score: rank + 1,
        user_ids: [userId],
        time_range: ['short_term'],
      })

      return t.save()
    })
  )

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
  const { User, Update, Track } = connectToDatabase()
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
  //!!
  await Promise.all(
    tracks.map(async ({ id, audioFeatures, popularity }, rank) => {
      let t = await Track.findOne({
        id,
        playlistId: topTablePlaylistId,
      })

      //add to existing
      if (t) {
        t.count = t.count + 1
        t.rank.push(rank + 1)

        t.score = calculateScore(t.rank, t.count)
        t.user_ids.push(userId)

        return await t.save()
      }

      t = await Track.create({
        playlistId: topTablePlaylistId,
        id,
        audioFeatures: { popularity, ...audioFeatures },
        rank: [rank + 1],
        score: rank + 1,
        user_ids: [userId],
      })

      list.tracks.push(await t.save())
    })
  )

  // tracks
  //   .map(({ id, audioFeatures, popularity }, rank) => ({
  //     playlistId: topTablePlaylistId,
  //     id,
  //     audioFeatures: { popularity, ...audioFeatures },
  //     rank: [rank + 1],
  //     score: rank + 1,
  //     user_ids: [userId],
  //   }))
  //   .forEach((t, rank) => {
  //     const exists = list.tracks.find((track) => track.id === t.id)
  //     if (exists) {
  //       exists.count = exists.count + 1
  //       exists.rank.push(rank + 1)
  //       exists.score = calculateScore(exists.rank, exists.count)
  //       exists.user_ids.push(userId)
  //     } else {
  //       list.tracks.push(t)
  //     }
  //   })

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

  //dont update if it hasn't been a day
  const { Update, User } = connectToDatabase()
  const _user = await User.findOne({ id: user.id })
  const lastUpdate = await Update.findOne({
    user: _user,
    playlist: Types.ObjectId(topTablePlaylistId),
  })
  const aDayAgo = Date.now() - 1000 * 60 * 60 * 24

  await removeUserTracksFromPlaylist(
    topTablePlaylistId,
    userId,
    tracks.map(({ id }) => id)
  )

  if (lastUpdate && new Date(lastUpdate.updated_at).getTime() > aDayAgo) {
    console.log('ITS NEW')
    return list
  }

  //* replace the users tracks with new ones
  // remove the ones
  const listWithoutUserTracks = await removeUserTracksFromPlaylist(
    list,
    userId,
    tracks.map(({ id }) => id)
  )
  return list

  await listWithoutUserTracks.save()

  // add the new
  const result = await addTracksToTopTablePlaylist(
    topTablePlaylistId,
    userId,
    tracks,
    user
  )

  return result
}

export const removeUserTracksFromPlaylist = async (
  topTablePlaylistId,
  userId,
  trackIds?: string[]
) => {
  const { Track, TopTracksPlaylist } = connectToDatabase()

  const trackUserId = `${userId}-short_term`
  let q: any = {
    user_ids: {
      $in: trackUserId,
    },
    playlistId: topTablePlaylistId,
  }
  if (trackIds) {
    q.id = {
      $in: trackIds,
    }
  }

  // remove user from tracks
  const tracks = await Track.find(q)
  console.log(tracks)
  const deleteTrackList = []
  Promise.all(
    tracks.map(async (t) => {
      const index = t.user_ids.indexOf(userId)
      t.rank.splice(index, 1)
      t.rank.splice(index, 1)
      t.score = calculateScore(t.rank, t.count)
      t.count = t.rank.length

      if (t.count === 0) {
        deleteTrackList.push(t._id)
      } else {
        const _ = await Track.findOne({ _id: t._id }) //, t)
        // const _ = await Track.updateOne({ _id: t._id }, t)
        console.log(_)
      }
      console.log(t)
    })
  )
  console.log(deleteTrackList)

  // await TopTracksPlaylist.update(
  //   { _id: topTablePlaylistId },
  //   {
  //     $pull: {
  //       tracks: { $in: [tracks.map((_) => new Types.ObjectId(_._id))] },
  //     },
  //   },
  //   { safe: true, multi: true },
  //   console.log
  // )
  // const playlist = await TopTracksPlaylist.findOne(topTablePlaylistId)

  // console.log(tracks)
  // return
  // const { ok } = await Track.deleteMany(q)
  // if (!ok) throw new Error('failed during updating tracks')

  return
  // list.tracks = list.tracks
  //   .map((listTrack) => {
  //     const trackId = trackIds.find((id) => id === listTrack.id)
  //     const index = listTrack.user_ids.indexOf(userId)

  //     if (!trackId || index === -1) {
  //       return listTrack
  //     }

  //     listTrack.user_ids.splice(index, 1)
  //     listTrack.rank.splice(index, 1)
  //     listTrack.score = calculateScore(listTrack.rank, listTrack.count)
  //     listTrack.count = listTrack.rank.length

  //     return listTrack
  //   })
  //   .filter(({ user_ids }) => user_ids.length)

  // return list
}
