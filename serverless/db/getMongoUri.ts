require('dotenv').config()

export const getMongoUri = () => {
  let MONGO_URI

  if (process.env.NODE_ENV === 'development') {
    MONGO_URI = process.env.MONGODB_URI_DEV
  } else if (process.env.NODE_ENV === 'staging') {
    MONGO_URI = process.env.MONGODB_URI_STG
  } else {
    MONGO_URI = process.env.MONGODB_URI
  }
  return MONGO_URI
}
