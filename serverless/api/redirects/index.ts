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
    const { Redirect } = connectToDatabase()
    const redirects = await Redirect.find(req.query)

    res.json(redirects)
  } catch (error) {
    res.status(500).send(error)
  }
})
