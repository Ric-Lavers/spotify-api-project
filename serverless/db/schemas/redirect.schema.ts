import mongoose from 'mongoose'

const Schema = mongoose.Schema

export const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
})
const counter = mongoose.model('counter', CounterSchema)

export const redirectSchema = new Schema({
  id: {
    type: Number,
    index: true,
  },
  party_blend_id: {
    type: String,
  },

  // optionally could be used instead of the party_blend_id
  slug: {
    // this needs to be unique if present
    type: String,
    unique: true,
    minLength: 3,
    set: (value) => value.trim().replace(/\s/g, '-'),
    // .replace(/[\w\-]+/g, ''),
  },
  //
  title: { type: String },
  description: String,
  greeting: String,
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    get: (user) => {
      if (user) {
        return {
          images: user.images,
          id: user.id,
          display_name: user.display_name,
        }
      }
      return user
    },
  },
})

redirectSchema.pre('save', function (next) {
  var doc = this

  const id = this.id

  if (doc.invitedBy === null) {
    doc.invitedBy = undefined
  }
  counter
    .findByIdAndUpdate(
      { _id: 'redirectCount' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    )
    .then(function (count) {
      doc.id = id ? id : count.seq
      next()
    })
    .catch(function (error) {
      console.error('counter error-> : ' + error)
      throw error
    })
})
