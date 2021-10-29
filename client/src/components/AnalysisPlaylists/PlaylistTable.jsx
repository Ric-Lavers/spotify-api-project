import React, { useState, useEffect } from 'react'
import get from 'lodash.get'
import Skeleton from 'react-loading-skeleton'

import { play } from 'api/spotify'
import { formatFeatures } from 'helpers'
import { isChecked, getAverages, getRows } from './PlaylistTable.utils'
import { SpotifyTrackGrid } from './SpotifyTrackGrid'

export const PlaylistTable = ({
  loading,
  updating,
  tracks,
  currentTrackId,
  uris,
  stats,
  onAllCheck,
  onCheckTrack,
  onSort = () => void {},
  currentSortValue,
  users = [],
  loadingMessage = 'Loading...',
  defaultSort = 'order',
  length,
  onLimitChange,
  limit,
}) => {
  const [sortValue, setSortValue] = useState('')
  const handleSort = (statKey) => {
    let sV
    if (!sortValue.includes(statKey)) sV = `${statKey}-DESC`
    else if (sortValue.endsWith('DESC')) sV = `${statKey}-ASC`
    else sV = `${defaultSort}-ASC`
    onSort({ target: { value: sV } })
    setSortValue(sV)
  }
  useEffect(() => {
    setSortValue(currentSortValue)
  }, [currentSortValue])

  const averages = React.useMemo(() => {
    if (loading) return []
    return getAverages(tracks, stats)
  }, [tracks, stats])

  const enableSelecting = onAllCheck && onCheckTrack
  const _stats = stats.filter((s) => !s.match('score|artists'))

  if (loading) {
    return null
  }
  if (!tracks.length) {
    return <Status>No tracks</Status>
  }
  return (
    <>
      <div className="table-container">
        <table
          className="playlist-table"
          border="0"
          cellspacing="0"
          cellpadding="0"
        >
          <thead>
            <tr>
              {enableSelecting ? (
                <th className="table-average">{averages.checked}</th>
              ) : stats.find((s) => s === 'score') ? (
                <th className="table-average" />
              ) : null}
              <th style={{ overflow: 'visible' }} className="table-average">
                {tracks.length} tracks{' '}
                {length ? <span className="length">of {length}</span> : ''}{' '}
              </th>
              {_stats.map((stat, i) => {
                return (
                  <th key={`${averages[stat]}-${i}`} className="table-average">
                    {averages[stat] === '' || averages[stat] === undefined
                      ? ''
                      : stat === 'popularity'
                      ? `${averages[stat]}%`
                      : formatFeatures(stat, averages)}
                  </th>
                )
              })}
            </tr>
            <tr>
              {enableSelecting && (
                <th style={{ textAlign: 'center' }}>
                  <input
                    onChange={({ target: { checked } }) => onAllCheck(checked)}
                    type="checkbox"
                    name="include"
                    defaultChecked={true}
                  />
                </th>
              )}
              {get(tracks[0], 'custom.score') &&
                stats.find((s) => s === 'score') && <th>#</th>}
              <th id="title-head">title</th>

              {_stats.map((statKey) => {
                return (
                  <th onClick={() => handleSort(statKey)}>
                    <span
                      className={
                        sortValue &&
                        sortValue.includes(statKey) &&
                        sortValue.split('-')[1]
                      }
                    >
                      {statKey}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, i) => {
              const { id, custom, name, uri, include } = track
              const rows = getRows(track)
              if (custom) {
                rows.count = custom.count
                rows.rank = custom.rank.join(', ')
                rows.user_ids = custom.user_ids.join(', ')
                rows.users = users.filter((u) =>
                  custom.user_ids.find((id) => id === u.id)
                )
              }
              const images = track.album.images || []
              const smallestImage = images[images.length - 1]
              const { checked, isLocalFile } = isChecked(uri, include)
              return (
                <tr className={updating ? 'updating' : ''} id={id}>
                  {enableSelecting && (
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
                  )}
                  {rows.score && stats.includes('score') && (
                    <td>
                      {' '}
                      {updating ? (
                        <Skeleton width={14} height={14} />
                      ) : (
                        rows.score
                      )}
                    </td>
                  )}
                  <td>
                    <SpotifyTrackGrid
                      name={name}
                      artists={formatFeatures('artists', rows)}
                      imageUrl={smallestImage.url}
                      currentlyPlaying={currentTrackId === id}
                      onClick={() =>
                        uris && play({ uris: uris, offset: { position: i } })
                      }
                      loading={updating}
                    />
                  </td>
                  {_stats.map((statKey) => (
                    <td>{formatFeatures(statKey, rows, false, updating)}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {onLimitChange && limit && length && (
        <div className="limit">
          <select
            onChange={({ target: { value } }) => onLimitChange(value)}
            value={limit}
          >
            {[50, 100, 250, 500, 1000].map((num) => (
              <option value={num}>{num} tracks</option>
            ))}
          </select>
        </div>
      )}
    </>
  )
}

export const Status = ({ loading, children }) =>
  !loading ? null : (
    <table
      style={{
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
      }}
      key="loading"
    >
      <thead>
        <th className="highlight">
          <div>{children}</div>
        </th>
      </thead>
    </table>
  )
