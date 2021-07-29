import { TrackObjectFull } from '../../types/spotify-api'
import { connectToDatabase } from '../connectToDB'
/**
 *
 */
export const addTrack = async (track: TrackObjectFull) => {
  const {
    id,
    album,
    artists,
    disc_number,
    duration_ms,
    explicit,
    external_ids,
    external_urls,
    href,
    name,
    popularity,
    preview_url,
    track_number,
    type,
    uri,
  } = track

  const { Track } = connectToDatabase()

  const prevTrack = await Track.findOne({ id }).catch(() => null)

  if (prevTrack) {
    return prevTrack
  }

  const newTrack = new Track({
    id,
    album,
    artists,
    disc_number,
    duration_ms,
    explicit,
    external_ids,
    external_urls,
    href,
    name,
    popularity,
    preview_url,
    track_number,
    type,
    uri,
  })

  await newTrack.save()
  return newTrack
}
