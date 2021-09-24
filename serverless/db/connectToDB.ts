//https://vercel.com/guides/deploying-a-mongodb-powered-api-with-node-and-vercel
const url = require('url')
const MongoClient = require('mongodb').MongoClient
const {
  trackSchema,
  artistSchema,
  userSchema,
  groupSchema,
  topTracksPlaylistSchema,
  updateSchema,
} = require('./schemas')
const mongoose = require('mongoose')
import wordSchema from './schemas/word.schema'
import { getMongoUri } from './getMongoUri'
// Create cached connection variable
let cachedDb = null

//* setup
mongoose.set('useFindAndModify', false)

export function connectToDatabase(
  uri = getMongoUri() || 'mongodb://localhost/demo'
) {
  // attach schemas
  const Group = mongoose.model('group', groupSchema)
  const Artist = mongoose.model('artist', artistSchema)
  const Track = mongoose.model('track', trackSchema)
  const Word = mongoose.model('word', wordSchema)
  // party blends
  const User = mongoose.model('user', userSchema)
  const TopTracksPlaylist = mongoose.model(
    'topTracksPlaylist',
    topTracksPlaylistSchema
  )
  const Update = mongoose.model('update', updateSchema)
  // If the database connection is cached,
  // use it instead of creating a new connection
  if (cachedDb) {
    return cachedDb
  }
  // If no connection is cached, create a new one
  mongoose.Promise = global.Promise
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  // Cache the database connection and return the connection
  cachedDb = {
    mongoose,
    Word,
    Track,
    Artist,
    Group,
    //
    User,
    TopTracksPlaylist,
    Update,
  }

  return cachedDb
}
