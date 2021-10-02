import React, { useState, useEffect } from 'react'
import get from 'lodash.get'
import Skeleton from 'react-loading-skeleton'

import { play } from 'api/spotify'
import { formatFeatures } from 'helpers'
import { isChecked, getAverages, getRows } from './PlaylistTable.utils'
import { SpotifyTrackGrid } from './SpotifyTrackGrid'
import { Survay_01 } from '../../pages/PartyPlaylist'

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
}) => {
  const [sortValue, setSortValue] = useState('')
  const handleSort = (statKey) => {
    let sV
    if (!sortValue.includes(statKey)) sV = `${statKey}-ASC`
    else if (sortValue.endsWith('ASC')) sV = `${statKey}-DESC`
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

  let tracksUnavailableMsg = loading
    ? loadingMessage
    : !tracks.length
    ? 'No tracks'
    : ''
  if (tracksUnavailableMsg) {
    return (
      <table
        style={{ display: 'flex', justifyContent: 'center' }}
        key="loading"
      >
        <thead>
          <th key={tracksUnavailableMsg} className="highlight">
            {tracksUnavailableMsg}
          </th>
        </thead>
      </table>
    )
  }
  const enableSelecting = onAllCheck && onCheckTrack
  const _stats = stats.filter((s) => !s.match('score|artists'))
  return !tracks.length ? null : (
    <>
      <section>
        <Survay_01 />
      </section>
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
              ) : (
                <th className="table-average" />
              )}
              <th style={{ overflow: 'visible' }} className="table-average">
                {tracks.length} tracks
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
              {get(tracks[0], 'custom.score') && <th>#</th>}
              <th>title</th>

              {_stats.map((statKey) => (
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
              ))}
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, i) => {
              const { id, custom, name, uri, include } = track
              const rows = getRows(track)
              if (custom) {
                // rows.score = custom.score
                rows.count = custom.count
                rows.rank = custom.rank.join(', ')
                rows.user_ids = custom.user_ids.join(', ')
                rows.users = users.filter((u) =>
                  custom.user_ids.find((id) => id.includes(u.id))
                )
              }
              const images = track.album.images || []
              const smallestImage = images[images.length - 1]
              const { checked, isLocalFile } = isChecked(uri, include)
              return (
                <tr id={id}>
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
    </>
  )
}
