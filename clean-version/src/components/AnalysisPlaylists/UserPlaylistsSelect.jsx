import React, { useState, useEffect, memo } from 'react'
import truncate from 'lodash.truncate'

export const UserPlaylistsSelect = ({
  label,
  playlists,
  currentPlaylistId,
  onChange,
  loadingStatus = '',
}) => {
  const [selectedPlaylist, setSelected] = useState(currentPlaylistId)
  useEffect(() => {
    setSelected(currentPlaylistId)
  }, [currentPlaylistId])

  const handleChange = ({ target: { value: playlistId } }) => {
    !currentPlaylistId && setSelected(playlistId)
    onChange(playlistId)
  }

  return (
    <label className="user-playlists">
      <span>{label}</span>
      <div>
        <select
          onChange={handleChange}
          className="playlists-select"
          value={selectedPlaylist}
        >
          <option></option>
          {playlists.map((pl) => (
            <option value={pl.id}>{truncate(pl.name)}</option>
          ))}
        </select>
        <span>{loadingStatus}</span>
      </div>
    </label>
  )
}

export default memo(UserPlaylistsSelect)
