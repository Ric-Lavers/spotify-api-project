import React, { useState, useEffect } from 'react'
import { play } from 'api/spotify'
import { formatFeatures } from 'helpers'
import { isChecked, getAverages, getRows } from './PlaylistTable.utils'

export const PlaylistTable = ({
  loading,
  tracks,
  currentTrackId,
  uris,
  stats,
  onAllCheck,
  onCheckTrack,
  onSort = () => void {},
  currentSortValue,
}) => {
  const [sortValue, setSortValue] = useState('')
  const handleSort = (statKey) => {
    let sV
    if (!sortValue.includes(statKey)) sV = `${statKey}-ASC`
    else if (sortValue.endsWith('ASC')) sV = `${statKey}-DESC`
    else sV = 'order-ASC'
    onSort({ target: { value: sV } })
    setSortValue(sV)
  }
  useEffect(() => {
    setSortValue(currentSortValue)
  }, [currentSortValue])

  const averages = React.useMemo(() => getAverages(tracks, stats), [
    tracks,
    stats,
  ])

  let tracksUnavailableMsg = loading
    ? 'Loading...'
    : !tracks.length
    ? 'No tracks'
    : ''
  if (tracksUnavailableMsg) {
    return (
      <table>
        <thead>
          <th>{tracksUnavailableMsg}</th>
        </thead>
      </table>
    )
  }

  return !tracks.length ? null : (
    <>
      <table className="playlist-table">
        <thead>
          <tr>
            <th className="table-average">{averages.checked}</th>
            <th className="table-average">count {tracks.length}</th>
            {stats.map((stat) => {
              return (
                <th className="table-average">
                  {stat === 'popularity'
                    ? `${averages[stat]}%`
                    : averages[stat] === ''
                    ? ''
                    : formatFeatures(stat, averages)}
                </th>
              )
            })}
          </tr>
          <tr>
            <th style={{ textAlign: 'center' }}>
              <input
                onChange={({ target: { checked } }) => onAllCheck(checked)}
                type="checkbox"
                name="include"
                defaultChecked={true}
              />
            </th>
            <th>title</th>

            {stats.map((statKey) => (
              <th onClick={() => handleSort(statKey)}>
                <span
                  className={
                    sortValue.includes(statKey) && sortValue.split('-')[1]
                  }
                >
                  {statKey}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, i) => {
            const { id, custom, name, uri, include } = track
            const rows = getRows(track)
            if (custom) {
              rows['score'] = custom.score
            }
            const { checked, isLocalFile } = isChecked(uri, include)
            return (
              <tr>
                <td style={{ textAlign: 'center' }}>
                  <input
                    onChange={({ target: { checked } }) =>
                      onCheckTrack(id, checked)
                    }
                    type="checkbox"
                    name="include"
                    checked={checked}
                    disabled={isLocalFile}
                  />
                </td>
                <td
                  className={`playlist__song ${
                    currentTrackId === id ? 'green' : ''
                  }`}
                  onClick={() =>
                    uris && play({ uris: uris, offset: { position: i } })
                  }
                >
                  {`${name} ${rows.score ? ` (${rows.score})` : ''}`}
                </td>

                {stats.map((statKey) => (
                  <td>{formatFeatures(statKey, rows)}</td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
