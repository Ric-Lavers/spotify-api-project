import Axios from 'axios'
import cheerio from 'cheerio'
const cors = require('micro-cors')()
const url = require('url')

module.exports = cors(async (req, res) => {
  try {
    const { data } = await Axios.get(
      `https://www.junodownload.com/search/?${url.parse(req.url).query}`
    )

    const $ = await cheerio.load(data)
    const notFound = $('.mt-5 > h2')?.text() === 'Sorry!'

    if (notFound) {
      res.status(404).send({ message: 'Not Found' })
      return
    }
    const trackHref = $('.juno-title')?.[0]?.attribs?.href
    if (!trackHref) {
      throw new Error('Something went wrong')
    }
    /** wishlist
     *
     * /products/acheless/4672772-02/?track_number=1
     * /wishlist/add/?title_id=4672772&product_id=02
     *   */
    const result = {
      trackUrl: 'https://www.junodownload.com' + trackHref,
    }

    res.send(result)
  } catch (error) {
    res.status(400).send(error)
  }
})
