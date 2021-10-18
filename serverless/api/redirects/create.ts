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
    const { Redirect, User } = connectToDatabase()
    // const { invitedBy: invitedById, ...body } = req.body
    const body = await Promise.all(
      [].concat(req.body).map(async ({ invitedBy: invitedById, ...b }) => {
        const invitedBy = await User.findOne(
          { id: invitedById },
          '-id id images display_name'
        )
        return { ...b, invitedBy }
      })
    )

    const redirects = await Redirect.create(body)

    res.json(redirects)
  } catch (error) {
    res.status(500).send(error)
  }
})
