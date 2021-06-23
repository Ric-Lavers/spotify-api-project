import Axios from 'axios'
import get from 'lodash.get'
import cheerio from 'cheerio'
const cors = require('micro-cors')()
const url = require('url')

module.exports = cors(async (req, res) => {
  try {
    const { data } = await Axios.get(
      `https://www.junodownload.com/search/?${url.parse(req.url).query}`
    )

    const $ = await cheerio.load(data)
    const notFound = $('.mt-5 > h2')

    if (notFound.length && notFound.text() === 'Sorry!') {
      throw new Error('Not Found')
    }

    const track = $('.juno-title')
    if (!track.length) {
      throw new Error('Something went wrong')
    }
    const trackHref = get(track[0], 'attribs.href') || track.attr('href')

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
    res.status(400).send({ ...error, message: error.message })
  }
})
