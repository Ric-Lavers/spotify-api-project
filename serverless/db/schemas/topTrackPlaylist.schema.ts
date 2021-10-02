import mongoose from 'mongoose'
import { userSchema } from './user.schema'

const Schema = mongoose.Schema
mongoose.set('useCreateIndex', true)

export const trackSchema = new Schema(
  {
    id: String,
    playlistId: String,

    user_ids: [{ type: String }],

    // the position from user top tables
    rank: [
      {
        type: Number,
        default: 0,
      },
    ],
    // used to determine the position in the playlist,
    // lowest to highest
    score: {
      type: Number,
      default: 0,
    },
    // the number of duplicates
    count: {
      type: Number,
      default: 1,
    },
    // time-range
    time_range: [String],
    audioFeatures: Object,
  },
  { toJSON: { virtuals: true } }
)

trackSchema.post('remove', function () {
  console.log('Removing!')
})
// used to determine the position in the playlist,
// lowest to highest
// trackSchema.virtual("score").get(function () {
//   return this.rank / this.count;
// });

export const topTracksPlaylistSchema = new Schema(
  {
    user_ids: [{ type: String }],
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'user',
        index: true,
      },
    ],
    title: String,
    description: String,
    tracks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'track',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

topTracksPlaylistSchema.virtual('length').get(function () {
  return this.tracks.length
})

topTracksPlaylistSchema.post('remove', function () {
  console.log('removing!')
})
