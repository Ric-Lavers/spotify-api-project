import mongoose from 'mongoose'

import { topTableSchema } from './topTable.schema'
const Schema = mongoose.Schema
mongoose.set('useCreateIndex', true)

export const userSchema = new Schema(
  {
    id: String,
    birthdate: String,
    country: String,
    display_name: String,
    email: String,
    external_urls: Object,
    followers: Object,
    href: String,
    images: [Object],
    product: String,
    type: String,
    uri: String,
    explicit_content: Object,

    spotify_playlist_id: Object,

    // track_short_term: [{ type: mongoose.Schema.Types.ObjectId, ref: "topTable" }],
    // track_medium_term: [
    //   { type: mongoose.Schema.Types.ObjectId, ref: "topTable" },
    // ],
    // track_long_term: [{ type: mongoose.Schema.Types.ObjectId, ref: "topTable" }],
    // artist_short_term: [
    //   { type: mongoose.Schema.Types.ObjectId, ref: "topTable" },
    // ],
    // artist_medium_term: [
    //   { type: mongoose.Schema.Types.ObjectId, ref: "topTable" },
    // ],
    // artist_long_term: [{ type: mongoose.Schema.Types.ObjectId, ref: "topTable" }],

    // track_short_term: [{ type: mongoose.Schema.Types.ObjectId, ref: "track" }],
    // track_medium_term: [{ type: mongoose.Schema.Types.ObjectId, ref: "track" }],
    // track_long_term: [{ type: mongoose.Schema.Types.ObjectId, ref: "track" }],
    // artist_short_term: [{ type: mongoose.Schema.Types.ObjectId, ref: "artist" }],
    // artist_medium_term: [{ type: mongoose.Schema.Types.ObjectId, ref: "artist" }],
    // artist_long_term: [{ type: mongoose.Schema.Types.ObjectId, ref: "artist" }],
    // groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "group" }],
    // color: {
    //   type: String,
    // },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)
