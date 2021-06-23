import React, { memo, useState, useContext, useEffect } from 'react'
import Fade from 'react-reveal/Fade'
import Slide from 'react-reveal/Slide'
import { CurrentPlayingContext } from '../../context'
import { getOneAudioFeatures } from '../../api/spotify'
import { getJunoTrackInfo } from '../../api/juno'
import { Utils } from '../../helpers'
import { GlobalContext } from 'globalContext'
import { formatFeatures } from 'helpers'

const { ucfirst } = Utils

export const stats = [
  'order',
  'mode',
  'popularity',
  'tempo',
  'key',
  'time_signature',
  'duration_ms',

  'danceability',
  'energy',
  'loudness',
  'speechiness',
  'acousticness',
  'instrumentalness',
  'liveness',
  'valence',
  'camelot',
]

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000)
  var seconds = ((millis % 60000) / 1000).toFixed(0)
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}
const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const StatsContainer = ({ song: _song }) => {
  const [audio_features, setFeatures] = useState(null)
  let song = useContext(CurrentPlayingContext)
  if (_song) {
    song = _song
  }

  const setAudioFeatures = async (trackId) => {
    try {
      const audio_features = await getOneAudioFeatures(trackId)
      setFeatures({ ...audio_features, popularity: song.item.popularity })
    } catch (error) {
      setFeatures(null)
    }
  }

  useEffect(() => {
    if (song.item.id) {
      setAudioFeatures(song.item.id)
    }
  }, [song.item.id])

  return audio_features ? (
    <Stats id={song.item.id} audio_features={audio_features} />
  ) : null
}

const Stats = memo(({ id, audio_features }) => {
  const [
    {
      visible: { stats: isHidden },
    },
  ] = useContext(GlobalContext)

  return (
    <Fade big when={isHidden}>
      <Slide duration={1000} left when={isHidden}>
        <div style={isHidden ? {} : { display: 'none' }} className="player">
          <table>
            <tbody>
              {stats.map((key, i) => {
                let value = formatFeatures(key, audio_features)

                return (
                  <tr key={key}>
                    <td>{ucfirst(key.replace('_', ' ').replace(' ms', ''))}</td>
                    <td>{value}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Slide>
    </Fade>
  )
})

export default StatsContainer
