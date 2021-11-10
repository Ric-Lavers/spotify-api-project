import { connectToDatabase } from '../../db/connectToDB'

const cors = require('micro-cors')()

/**
 * adding redirects are
 */
module.exports = cors(async function (req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200)
    res.send()
    return
  }
  try {
    if (req.method !== 'DELETE') {
      throw new Error('incorrect method')
    }
    const { Redirect } = connectToDatabase()
    const { ok, deletedCount } = await Redirect.remove({ slug: req.query.slug })

    res.json({ ok, deletedCount })
  } catch (error) {
    res.status(500).send(error)
  }
})
