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
    const { ids, id, invitedBy: invitedById, ...body } = req.body

    const { Redirect, User } = connectToDatabase()

    const invitedBy = await User.findOne({ id: invitedById })
    let updatedRedirects
    if (ids) {
      updatedRedirects = await Redirect.updateMany(
        { id: { $in: ids } },
        { ...body, invitedBy }
      )
    } else {
      updatedRedirects = await Redirect.findOneAndUpdate(
        { id },
        { ...body, invitedBy }
      )
    }

    res.json(updatedRedirects)
  } catch (error) {
    res.status(500).send(error)
  }
})
