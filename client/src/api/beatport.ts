import { beatportFetch } from './utils'

interface BeatportTrackInfo {
  trackUrl: string
  artistUrl: string
}

export const getBeatportTrackInfo = async ({
  title = '',
  artist = '',
}: {
  title: string
  artist: string
}): Promise<BeatportTrackInfo | null> => {
  try {
    const trackInfo: BeatportTrackInfo = await beatportFetch(
      `search?artist=${artist}&title=${title}`
    ).then((d) => d.json())

    return trackInfo
  } catch (error) {
    return null
  }
}
