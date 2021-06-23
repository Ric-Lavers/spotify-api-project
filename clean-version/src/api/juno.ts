import { junoFetch } from './utils'

interface JunoTrackInfo {
  trackUrl: string
}

export const getJunoTrackInfo = async ({
  track = '',
  artist = '',
}: {
  track: string
  artist: string
}): Promise<JunoTrackInfo | null> => {
  try {
    const trackInfo: JunoTrackInfo = await junoFetch(
      `search?solrorder=relevancy&q[artist][]=${artist}&q[title][]=${track}`
    ).then((d) => d.json())

    return trackInfo
  } catch (error) {
    return null
  }
}
