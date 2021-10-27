import { connectToDatabase } from '../../db/connectToDB'

const cors = require('micro-cors')()

module.exports = cors(async function (req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.status(200)
      res.send()
      return
    }
    const { Redirect } = connectToDatabase()
    const { slug, party_blend_id } = await Redirect.findOne({
      id: Number(req.query.id),
    })

    res.redirect(`https://party-blends.com/${slug || party_blend_id || ''}`)
  } catch (error) {
    console.log('api/redirects', error)
    res.redirect('https://party-blends.com/')
    res.status(400).send(error)
  }
})
