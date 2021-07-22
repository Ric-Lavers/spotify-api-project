import { discogsFetch } from './utils'

interface DiscogsTrackInfo {
  trackUrl: string
  price?: number
  videos?: {
    uri: string
    title: string
    description?: string
    duration: number
    embed: boolean
  }
  genres?: string[]
  styles?: string[]
}

export const getDiscogsTrackInfo = async ({
  track = '',
  artist = '',
}: {
  track: string
  artist: string
}): Promise<DiscogsTrackInfo | null> => {
  try {
    const trackInfo: DiscogsTrackInfo = await discogsFetch(
      `search?artist=${artist}&track=${track}`
    ).then((d) => d.json())

    return trackInfo
  } catch (error) {
    return null
  }
}
