import mongoose from 'mongoose'

const Schema = mongoose.Schema

export const updateSchema = new Schema({
  user: {
    //@ts-ignore
    type: mongoose.ObjectId,
    ref: 'user',
    index: true,
  },
  playlist: {
    //@ts-ignore
    type: mongoose.ObjectId,
    ref: 'topTracksPlaylist',
    index: true,
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
  updated_at: {
    type: Date,
    default: new Date(),
  },
})
