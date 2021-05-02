import React, { useState, useEffect, memo } from 'react'
import truncate from 'lodash.truncate'
import { Kebab, Menu } from 'components/common/s-menu'

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

  const [open, setOpen] = useState(false)
  const toggleOpen = () => setOpen((prev) => !prev)

  const handleChange = (playlistId) => {
    !currentPlaylistId && setSelected(playlistId)
    onChange(playlistId)
    setOpen(false)
  }

  return (
    <>
      <label className="user-playlists">
        <span>{label}</span>
        <Kebab onClick={toggleOpen} loadingStatus={loadingStatus}>
          <Menu
            open={open}
            onClick={handleChange}
            list={playlists.map((pl) => ({
              value: pl.id,
              label: pl.name,
            }))}
            currentPlaylistId={currentPlaylistId}
          />
        </Kebab>
      </label>
    </>
  )
}

export default memo(UserPlaylistsSelect)
