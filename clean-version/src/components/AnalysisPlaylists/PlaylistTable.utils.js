import { formatFeatures } from 'helpers'
import { tableKeys } from 'pages/AnalysisPlaylists'

export const isChecked = (uri, include) => {
  const isLocalFile = uri.match('spotify:local')
  return {
    checked: !isLocalFile && include,
    isLocalFile,
  }
}

export const getRows = ({
  album: { name: albumName },
  artists,
  audioFeatures,
  popularity,
  order,
  custom,
}) => {
  const rows = {
    artists,
    albumName,
    popularity,
    order,
    ...audioFeatures,
  }
  if (custom) {
    rows['score'] = custom.score
  }
  return rows
}

export const getAverages = (tracks, stats) => {
  const specs = tracks.reduce(
    (a, track, i) => {
      const { uri, include, order, ...averageTrackFields } = track
      const rows = getRows(averageTrackFields)
      const { checked } = isChecked(uri, include)
      a.checked.push(checked ? 1 : 0)
      tableKeys.forEach((statKey) =>
        a[statKey].push(formatFeatures(statKey, rows, true))
      )

      return a
    },
    tableKeys.reduce(
      (a, k) => {
        a[k] = []
        return a
      },
      { checked: [] }
    )
  )
  for (let k in specs) {
    if (typeof specs[k][0] === 'number') {
      const sum = specs[k].reduce((a, b) => a + b, 0)
      const avg = sum / specs[k].length || 0
      if (k === 'checked') specs[k] = sum
      else specs[k] = Math.round(avg * 1000, 2) / 1000
    } else {
      specs[k] = ''
    }
  }
  return specs
}
