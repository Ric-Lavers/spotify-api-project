import { AudioFeaturesObject } from '../types/spotify-api'

export function getStandardDeviation(array = []) {
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  const variance =
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
  return Math.sqrt(variance)
}

interface TrackFeatures extends AudioFeaturesObject {
  popularity: number
}

interface UserAverages {
  [key: string]: {
    mean: number
    std: number
    min: number
    max: number
  }
}

export const numberAudiofeatures = [
  'popularity',
  'danceability',
  'energy',
  'speechiness',
  'acousticness',
  'instrumentalness',
  'liveness',
  'valence',
  'tempo',
  //* dont really care about these
  // 'loudness',
  // 'key',
  // 'mode',
  // 'duration_ms',
  // 'time_signature',
]

const roundTo4 = (num) => Math.round(num * 10000) / 10000
export const calculateTrackAverages = (
  audioFeaturesList: TrackFeatures[]
): UserAverages => {
  const averages = {}
  const len = audioFeaturesList.length
  for (let feature of numberAudiofeatures) {
    const values = audioFeaturesList.map((af) => af[feature] as number)
    const sum = values.reduce((a, c) => a + c, 0)

    averages[feature] = {
      mean: roundTo4(sum / len),
      std: roundTo4(getStandardDeviation(values)),
      min: roundTo4(Math.min(...values)),
      max: roundTo4(Math.max(...values)),
    }
  }
  return averages
}

export const scoreTrackAgainstAverages = (
  trackAudioFeatures,
  userFeatureAverages: UserAverages
) => {
  const result = {}
  let sum = 0

  for (let feature in userFeatureAverages) {
    const diference = Math.abs(
      userFeatureAverages[feature].mean - trackAudioFeatures[feature]
    )

    const zScore = roundTo4(diference / userFeatureAverages[feature].std)
    sum += zScore
    result[feature] = zScore
  }
  const total = roundTo4(sum / Object.keys(userFeatureAverages).length)
  return { ...result, total }
}
