//https://vercel.com/guides/deploying-a-mongodb-powered-api-with-node-and-vercel
const {
  trackSchema,
  artistSchema,
  userSchema,
  topTracksPlaylistSchema,
  updateSchema,
  redirectSchema,
} = require('./schemas')
const mongoose = require('mongoose')
import { getMongoUri } from './getMongoUri'
// Create cached connection variable
let cachedDb = null

//* setup
mongoose.set('useFindAndModify', false)

export function connectToDatabase(
  uri = getMongoUri() || 'mongodb://localhost/demo'
) {
  // attach schemas
  const Redirect = mongoose.model('redirect', redirectSchema)
  const Artist = mongoose.model('artist', artistSchema)
  const Track = mongoose.model('track', trackSchema)
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
    Artist,
    //
    Track,
    User,
    TopTracksPlaylist,
    Update,
    Redirect,
  }

  return cachedDb
}
