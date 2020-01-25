import React, { memo, useState, useContext, useEffect } from 'react'
import { CurrentPlayingContext } from '../../context';
import { getOneAudioFeatures } from '../../api/spotify'
import { Utils } from '../../helpers'

const {ucfirst} = Utils

const stat = [
	"mode",
	"tempo",
	"key",
	"time_signature",
	"duration_ms",

	"danceability",
	"energy",
	"loudness",
	"speechiness",
	"acousticness",
	"instrumentalness",
	"liveness",
	"valence",
]

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}
const keys = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

const StatsContainer = () => {
	const [ audio_features, setFeatures ] = useState(null)
	const song = useContext(CurrentPlayingContext)

	useEffect(() => {
		if ( song.item.id.length ) {
			setAudioFeatures(song.item.id);
		}

	}, [song.item.id])
	
	const setAudioFeatures = async trackId => {
		
		try {
			const audio_features = await getOneAudioFeatures(trackId)
			setFeatures(audio_features)
		} catch (error) {
			setFeatures(null)
		}
	}
	

	return audio_features 
		? <Stats id={song.item.id} audio_features={audio_features}/>
		: null
}

const Stats = memo(({id, audio_features}) => {
	console.log(audio_features)
	return (
		<div className='player' >
			<table>
				<tbody>
					{stat.map( (key, i) => {
						let value = () => {
							switch(key) {
								case 'key':
									return keys[audio_features[key]]
								case 'mode':
									return key ? 'Major' : 'Minor'
								case 'tempo':
									return `${Math.round(audio_features[key])}bpm`
								case 'duration_ms':
									return millisToMinutesAndSeconds(audio_features[key])
								default:
									return audio_features[key]
							}
						}
						return(
							<tr>
								<td>{ucfirst(key.replace('_', ' ').replace(' ms', ''))}</td>
								<td>{value()}</td>
							</tr>
						)
					})}
				</tbody>
			</table>
			
		</div>
	)
})

export default StatsContainer


const json ={
	// default
	"mode": 1,
	"tempo": 95.032,
	"key": 9,
	"time_signature": 4,
	"duration_ms": 261566,

	//optional
	"danceability": 0.689,
	"energy": 0.861,
	"loudness": -9.494,
	"speechiness": 0.188,
	"acousticness": 0.169,
	"instrumentalness": 0.0000418,
	"liveness": 0.403,
	"valence": 0.439,

	//hide
	"type": "audio_features",
	"id": "7GBrg6uPsklvih3b59Mn0u",
	"uri": "spotify:track:7GBrg6uPsklvih3b59Mn0u",
	"track_href": "https://api.spotify.com/v1/tracks/7GBrg6uPsklvih3b59Mn0u",
	"analysis_url": "https://api.spotify.com/v1/audio-analysis/7GBrg6uPsklvih3b59Mn0u",
	
}