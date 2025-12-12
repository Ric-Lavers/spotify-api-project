import React, { useState, useEffect, memo } from 'react'

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
  const toggleOpen = () => {
    setOpen((prev) => !prev)
  }
  useEffect(() => {
    const clickOutside = () => {
      setOpen(false)
    }
    if (open) {
      window.addEventListener('click', clickOutside)
    } else {
      window.removeEventListener('click', clickOutside)
    }
    return () => window.removeEventListener('click', clickOutside)
  }, [open])

  const handleChange = (playlistId) => {
    !currentPlaylistId && setSelected(playlistId)
    onChange(playlistId)
    setOpen(false)
  }

  const options = playlists.map((pl) => ({
    value: pl.value || pl.id,
    label: pl.label || pl.name,
  }))

  return (
    <>
      <label className="user-playlists">
        <span>{label}</span>

        {
          <Kebab onClick={toggleOpen} loadingStatus={loadingStatus}>
            <Menu
              open={open}
              onClick={handleChange}
              list={options}
              currentPlaylistId={currentPlaylistId}
            />
          </Kebab>
        }
      </label>
    </>
  )
}
export default memo(UserPlaylistsSelect)
