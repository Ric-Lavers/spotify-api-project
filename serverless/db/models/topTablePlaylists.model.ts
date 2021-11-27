import { Types } from 'mongoose'
import get from 'lodash.get'
import Axios from 'axios'
import { connectToDatabase } from '../connectToDB'
import {
  TrackObjectFull,
  UserObjectPrivate,
  AudioFeaturesObject,
} from '../../types/spotify-api'
import {
  calculateTrackAverages,
  numberAudiofeatures,
  scoreTrackAgainstAverages,
} from '../../utils/getStandardDeviation'
import { createZScoreAggregate } from '../queries/createZScoreAggregate'
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
    '_id description title created_at updated_at'
  )

  return usersLists
}

const slugToId = async (partyBlendId: string): Promise<string> => {
  const { Redirect } = connectToDatabase()
  const redirect = await Redirect.findOne({
    slug: partyBlendId,
  })

  if (redirect) {
    return redirect.party_blend_id
  }

  return partyBlendId
}

export const getUsersTracksAverages = async (partyBlendId, user_id) => {
  const { Track } = connectToDatabase()
  const tracks = await Track.find(
    { playlistId: partyBlendId, user_ids: { $in: user_id } },
    '-_id -playlistId'
  )
  const trackAverages = calculateTrackAverages(
    tracks.map((t) => t.audioFeatures)
  )

  return trackAverages
}

/**
 * sort the playlist
 * initially set as with tracks with most users on top
 */
export const getTopTablePlaylistById = async (
  topTablePlaylistId: string,
  sort?: string,
  direction: 'asc' | 'desc' | 'ASC' | 'DESC' | number = 1,
  limit: number = 100,
  user_id?: string
) => {
  const { TopTracksPlaylist, Update, Track } = connectToDatabase()

  const partyBlendId = await slugToId(topTablePlaylistId)

  let data = await TopTracksPlaylist.findById(partyBlendId)
    .populate(
      'users',
      'created_at updated_at display_name id images _id spotify_playlist_id image'
    )
    .then((d) => {
      d.users.map((u) => {
        u.spotify_playlist_id =
          user_id === u.id
            ? get(u, `spotify_playlist_id.${partyBlendId}`)
            : null
      })

      return d.toJSON()
    })

  //TODO can this be linked in the schema or something
  const lastUpdates = await Update.find({ playlist: data }).then((updates) =>
    (updates || []).reduce((a, { user, updated_at }) => {
      a[user] = updated_at
      return a
    }, {})
  )

  data.users.forEach((u) => {
    u.updated_at = lastUpdates[u._id] || u.updated_at
  })

  if (typeof direction !== 'number') {
    if (direction === 'ASC') {
      direction = 1
    }
    if (direction === 'DESC') {
      direction = -1
    }
  }

  //* sort by this score to get most similar
  if (sort === 'zScore') {
    const userAverages = await getUsersTracksAverages(partyBlendId, user_id)
    const tracks = await Track.aggregate(
      createZScoreAggregate(
        partyBlendId,
        numberAudiofeatures,
        userAverages,
        direction,
        limit
      )
    )

    tracks.forEach((track) => {
      track.audioFeatures.zScore = track.zScores.total
    })

    data.tracks = tracks
    return data
  }
  //TODO above might not even really be helpful

  const tracks = await Track.find(
    { playlistId: partyBlendId },
    '-_id -playlistId'
  )
    .sort(
      sort
        ? { [`audioFeatures.${sort}`]: direction }
        : [
            ['count', -1],
            ['score', 1],
          ]
    )
    .limit(limit)

  data.tracks = tracks
  return data
}

/**
 * saves the spotify playlist id to the user
 */
export const saveSpotifyPlaylistId = async (
  spotify_user_id: string,
  party_blend_id: string,
  spotify_playlist_id: string,
  key: string = ''
) => {
  const { User } = connectToDatabase()

  const partyBlendId = await slugToId(party_blend_id)

  const currentUser = await User.findOne({ id: spotify_user_id })
  const spotify_playlist_ids = currentUser.spotify_playlist_id || {}
  const currentPlaylistSpotifyLinks = spotify_playlist_ids[party_blend_id] || {}

  const user = await User.findOneAndUpdate(
    { id: spotify_user_id },
    {
      spotify_playlist_id: {
        ...spotify_playlist_ids,
        [partyBlendId]: {
          ...currentPlaylistSpotifyLinks,
          [key]: spotify_playlist_id,
        },
      },
    },
    { new: true }
  )

  return user.spotify_playlist_id[partyBlendId]
}

export const getSpotifyLinksForPlaylist = async (
  spotify_user_id: string,
  party_blend_id: string
) => {
  const { User } = connectToDatabase()

  const { spotify_playlist_ids } = await User.findOne(
    { id: spotify_user_id },
    'spotify_playlist_ids'
  )
  const partyBlendId = await slugToId(party_blend_id)

  return spotify_playlist_ids[partyBlendId] || {}
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

  const existingUser = await User.findOneAndUpdate(
    { id: body.user.id },
    { images: body.user.images },
    {
      new: true,
    }
  )

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
  party_blend_id,
  userId: string,
  tracks: TrackObjectWithFeatures[],
  user: UserObjectPrivate
) => {
  const partyBlendId = await slugToId(party_blend_id)
  const { User, Update, Track, TopTracksPlaylist } = connectToDatabase()
  const list = await TopTracksPlaylist.findById(partyBlendId)

  let image: { image?: Buffer } = {}
  if (get(user, 'images[0].url')) {
    let { data: imageBuffer } = await Axios.get(user.images[0].url, {
      responseType: 'arraybuffer',
    })
    image.image = imageBuffer
  }

  const u = await User.findOneAndUpdate(
    { id: user.id },
    { ...user, ...image },
    {
      upsert: true,
      new: true,
    }
  )
  const userExists = !!list.user_ids.find((id) => id === user.id)

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
        playlistId: partyBlendId,
      })

      //add to existing
      if (t) {
        t.count = t.count + 1
        t.rank.push(rank + 1)

        t.score = calculateScore(t.rank, t.count)
        t.user_ids.push(userId)

        return await t.save()
      }

      // create new
      t = await Track.create({
        playlistId: partyBlendId,
        id,
        audioFeatures: { popularity, ...audioFeatures },
        rank: [rank + 1],
        score: rank + 1,
        user_ids: [userId],
      })

      list.tracks.push(await t.save())
    })
  )

  await list.save()
  const result = await getTopTablePlaylistById(partyBlendId, userId)
  return result
}

export const updateTracksToTopTablePlaylist = async (
  party_blend_id,
  userId: string,
  tracks: TrackObjectWithFeatures[],
  user: UserObjectPrivate
) => {
  const partyBlendId = await slugToId(party_blend_id)
  const list = await getTopTablePlaylistById(partyBlendId, userId)

  //dont update if it hasn't been a day
  const { Update, User, Track } = connectToDatabase()
  const _user = await User.findOne({ id: user.id })

  const lastUpdate = await Update.findOne({
    user: _user,
    playlist: Types.ObjectId(partyBlendId),
  })
  const aDayAgo = Date.now() - 1000 * 60 * 60 * 24

  if (lastUpdate && new Date(lastUpdate.updated_at).getTime() > aDayAgo) {
    //TODO below patches bad data from failed initial add
    const hasTracks = await Track.find({
      playlistId: partyBlendId,
      user_ids: { $in: userId },
    })
    if (hasTracks.length !== 0) {
      console.log('skipping update')

      return list
    }
  }

  //* replace the users tracks with new ones
  // remove the ones

  await removeUserTracksFromPlaylist(partyBlendId, userId)

  // add the new
  const result = await addTracksToTopTablePlaylist(
    partyBlendId,
    userId,
    tracks,
    user
  )

  return result
}

export const removeUserFromPlaylist = async (party_blend_id, userId) => {
  const partyBlendId = await slugToId(party_blend_id)
  const { User, TopTracksPlaylist } = connectToDatabase()
  const user = await User.findOne({ id: userId })

  await User.updateOne(
    { id: userId },
    { $unset: { [`spotify_playlist_id.${partyBlendId}`]: 1 } }
  )

  return await TopTracksPlaylist.updateOne(
    { _id: partyBlendId },
    {
      $pull: { users: { $in: [user] }, user_ids: { $in: [userId] } },
    }
  )
}

export const removeUserTracksFromPlaylist = async (
  party_blend_id,
  userId,
  trackIds?: string[]
) => {
  const partyBlendId = await slugToId(party_blend_id)
  const { Track, TopTracksPlaylist } = connectToDatabase()

  const trackUserId = [].concat(userId)
  let q: any = {
    user_ids: {
      $in: trackUserId,
    },
    playlistId: partyBlendId,
  }
  if (trackIds) {
    q.id = {
      $in: [].concat(trackIds),
    }
  }

  // remove user from tracks
  const tracks = await Track.find(q)

  const deleteTrackList = []
  let updatedCount = 0
  Promise.all(
    tracks.map(async (t) => {
      const index = t.user_ids.indexOf(userId)
      t.rank.splice(index, 1)
      t.user_ids.splice(index, 1)
      t.score = calculateScore(t.rank, t.count)
      t.count = t.rank.length

      if (t.count === 0) {
        deleteTrackList.push(t._id)
      } else {
        await Track.updateOne(
          { _id: t._id },
          {
            rank: t.rank,
            user_ids: t.user_ids,
            score: t.score,
            count: t.count,
          }
        )
        updatedCount++
      }
    })
  )

  const result = await Track.deleteMany({ _id: { $in: deleteTrackList } })

  // remove from playlist tracks
  await TopTracksPlaylist.updateOne(
    { _id: partyBlendId },
    {
      $pull: { tracks: { $in: deleteTrackList } },
    }
  )

  return { ...result, updatedCount }

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
