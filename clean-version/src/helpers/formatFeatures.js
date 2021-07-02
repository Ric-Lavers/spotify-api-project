import React from 'react'
//https://developer.spotify.com/documentation/web-api/reference/#object-audiofeaturesobject

import PopularityMeter from 'images/custom-svgs/PopularityMeter'
import { millisToMinutesAndSeconds } from './millisToMinutesAndSeconds'
import { combineArtists } from 'helpers'
import { JunoLink } from '../hooks/useJunoTrack'
import { BeatportLink } from '../hooks/useBeatportTrack'
import { DiscogsLink } from '../hooks/useDiscogs'

const keys = [
  'C',
  'C♯/D♭',
  'D',
  'D♯/E♭',
  'E',
  'F',
  'F♯/G♭',
  'G',
  'G♯/A♭',
  'A',
  'A♯/B♭',
  'B',
]
//audio_features are badly named its a col
const blockRaw = ['mode', 'key', 'order']
export function formatFeatures(key, audio_features, raw = false) {
  // i'm using this for averages now too which is has removed string types
  if (raw && !blockRaw.includes(key)) {
    return audio_features[key]
  }
  switch (key) {
    case 'key':
      return keys[audio_features[key]]
    case 'mode':
      return audio_features[key] === 1 ? 'Major' : 'Minor'
    case 'tempo':
      return `${Math.round(audio_features[key])}bpm`
    case 'artists':
      return combineArtists(audio_features[key])
    case 'duration_ms':
      return millisToMinutesAndSeconds(audio_features[key])
    case 'popularity':
      return <PopularityMeter popularity={audio_features[key]} />

    case 'download':
      return (
        <div className="download-links">
          <BeatportLink
            size="sm"
            loader={'🤞'}
            trackName={audio_features.name}
            artistName={audio_features.artists[0].name}
          />
          <JunoLink
            size="sm"
            loader={'🤞'}
            trackName={audio_features.name}
            artistName={audio_features.artists[0].name}
          />
          <DiscogsLink
            size="sm"
            loader={'🤞'}
            trackName={audio_features.name}
            artistName={audio_features.artists[0].name}
          />
        </div>
      )
    default:
      return audio_features[key]
  }
}
