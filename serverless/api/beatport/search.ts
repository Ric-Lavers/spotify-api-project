import Axios from 'axios'
import get from 'lodash.get'
import cheerio from 'cheerio'
const cors = require('micro-cors')()
const url = require('url')
var { log } = console
/**
 * searches for artist and title, looks through track table.
 *   if no match then looks through artists tracks for a match
 * NOTE: it is perhaps not likely to find a match on 2nd search, monitor the logs and delete if "result found via artist" is rarely present
 */
module.exports = cors(async (req, res) => {
  try {
    const { artist: artistName, title: _title } = req.query
    const title = _title.split(' - ')[0]
    const { data } = await Axios.get(
      `https://www.beatport.com/search?q=${req.query.artist} ${title}`
    )

    let result = await getTrackViaSearch(data, title, artistName)

    if (!result) {
      result = await getTrackViaArtist(data, title, artistName)
      if (!result) {
        throw new Error('Not Found')
      } else {
        console.count('result found via artist')
      }
    }

    res.send(result)
  } catch (error) {
    if (error.message === 'Not Found')
      res.status(404).send({ ...error, message: error.message })
    else res.status(400).send({ ...error, message: error.message })
  }
})

const getTrackViaSearch = async (data, title, artistName) => {
  const $ = await cheerio.load(data)
  const tracks = $('.track')
  const notFound = !tracks.length

  if (notFound) {
    return
  }
  const track = $(tracks).filter(function () {
    const trackTitle =
      $('.buk-track-primary-title', this).text() +
      ' ' +
      $('.buk-track-remixed', this).text()

    const isArtist =
      $('.buk-track-artists', this).text().toLowerCase().trim() ===
      artistName.toLowerCase().trim()

    if (trackTitle.toLowerCase().includes(title.toLowerCase()) && isArtist) {
      return this
    }
  })
  const trackHref = $('.buk-track-title a', track).attr('href')

  if (!track.length || !trackHref) {
    return
  }
  const artist = $('.artists li').filter(function () {
    if (
      $('.artist-name', this).text().toLowerCase() === artistName.toLowerCase()
    ) {
      return this
    }
    return
  })
  const artistHref = $(artist).find('a').attr('href')

  let price = $(`[data-track="${trackHref.match(/\d+/)[0]}"][data-price]`)
  if (price) {
    log(price.attr('data-price'))

    price = price.attr('data-price')
  }
  // log(price)

  return {
    artistUrl: 'https://www.beatport.com' + artistHref,
    trackUrl: 'https://www.beatport.com' + trackHref,
    price,
  }
}

const getTrackViaArtist = async (data, title, artistName) => {
  const $ = await cheerio.load(data)

  const artists = $('.artists')
  const notFound = !artists.length
  const artist = $('.artists li').filter(function () {
    if (
      $('.artist-name', this).text().toLowerCase() === artistName.toLowerCase()
    )
      return this
    return
  })

  if (notFound || !artist.length) {
    return
  }
  const artistUrl = $(artist).find('a').attr('href')

  let artistTracks = `https://www.beatport.com${artistUrl}/tracks?page=1&per-page=150`
  let { data: trackPage } = await Axios.get(artistTracks)
  let $tracks = await cheerio.load(trackPage)
  const pageNumbers = $tracks('.pag-numbers').length

  /**
   * finds tracks from artist track listing
   */
  const findTrack = ($tracks) => {
    const track = $tracks('.buk-track-title').filter(function () {
      const trackTitle =
        $tracks('.buk-track-primary-title', this).text() +
        ' ' +
        $tracks('.buk-track-remixed', this).text()

      if (trackTitle.toLowerCase().includes(title.toLowerCase())) {
        return this
      }
    })
    return $tracks(track).find('a').attr('href')
  }
  let trackHref = findTrack($tracks)

  /**
   * searches additional pages
   */
  const searchTrackPages = async () => {
    let result

    for (let i = 2; i <= pageNumbers; i++) {
      let artistTracks = `https://www.beatport.com${artistUrl}/tracks?page=${i}&per-page=150`

      let { data: trackPage } = await Axios.get(artistTracks)
      let $tracks = await cheerio.load(trackPage)
      result = findTrack($tracks)
      if (result) {
        break
      }
    }
    return result
  }
  if (!trackHref && pageNumbers && pageNumbers != 1) {
    trackHref = await searchTrackPages()
  }

  if (!trackHref) {
    return
  }

  return {
    artistUrl: 'https://www.beatport.com' + artistUrl,
    trackUrl: 'https://www.beatport.com' + trackHref,
  }
}
