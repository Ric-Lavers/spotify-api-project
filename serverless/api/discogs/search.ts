import Axios from 'axios'
const cors = require('micro-cors')()
var { keys } = Object
module.exports = cors(async (req, res) => {
  try {
    const { track, artist } = req.query
    let { data } = await Axios.get(
      `https://api.discogs.com/database/search?track=${track}&artist=${artist}&key=zWqDQEdZNBUyXWjTcySJ&secret=emdlIndOzbVmKcLjNbEaZlgkDvPjcskT`
    )

    let notFound = data.pagination.items === 0

    if (notFound) {
      let { data: data_ } = await Axios.get(
        `https://api.discogs.com/database/search?title=${track}&artist=${artist}&key=zWqDQEdZNBUyXWjTcySJ&secret=emdlIndOzbVmKcLjNbEaZlgkDvPjcskT`
      )
      data = data_
      notFound = data.pagination.items === 0
      if (notFound) throw new Error('Not Found')
    }

    const result = data.results[0]
    const trackUri = result.uri
    const master_url = result.master_url

    //@ts-ignore
    let extraData: {
      price: number
      videos?: {
        uri: string
        title: string
        description?: string
        duration: number
        embed: boolean
      }[]
      genres: string[]
      styles: string[]
    } = {}
    try {
      const {
        data: releaseData,
        data: { lowest_price, genres, styles },
      } = await Axios.get(master_url)
      extraData = { price: lowest_price, genres, styles }
      keys(releaseData.videos).length &&
        (() => {
          extraData.videos = releaseData.videos
        })()
    } catch (error) {}

    const result_ = {
      trackUrl: 'https://www.discogs.com' + trackUri,
      ...extraData,
    }

    res.send(result_)
  } catch (error) {
    res.status(400).send({ ...error, message: error.message })
  }
})
