export const top_time_range = [
  { value: 'short_term', label: '4 weeks' },
  { value: 'medium_term', label: '6 months' },
  { value: 'long_term', label: 'Years' },
]

export const savedTracks = {
  id: 'me_tracks',
  name: 'Your saved tracks',
}

export const specialPlaylists = top_time_range.map(({ value, label }) => ({
  id: value,
  name: `Top tracks - ${label}`,
}))
