import React, { useState, useEffect } from 'react'
import Input from '../common/Input/Input'

export const SavePlaylist = ({
  user_id,
  currentSort,
  currentPlaylist,
  createPlaylist,
  description: _description = '',
  mergedPlaylistNames = [],
}) => {
  const [{ name, description, isPublic, collaborative }, setValues] = useState({
    name: currentPlaylist ? currentPlaylist.name : '',
    description: _description,
    isPublic: false,
    collaborative: false,
  })
  const currentPlaylistName = currentPlaylist && currentPlaylist.name
  useEffect(() => {
    if (currentPlaylist && currentPlaylist.name) {
      const sortName =
        currentSort &&
        !currentSort.startsWith('order') &&
        !currentSort.startsWith(' -')
          ? ` (${currentSort})`
          : ''
      const playlistName = `${[
        currentPlaylist.name || name,
        ...mergedPlaylistNames.map((name) =>
          name.replace(/(\(\w+\s-\s[A-Z]+\))/, '')
        ),
      ].join(' + ')}${sortName}`

      setValues((prev) => ({
        ...prev,
        name: playlistName,
      }))
    }
  }, [currentPlaylistName, currentSort, mergedPlaylistNames])

  const handleChange = ({ target: { name, value, checked } }) => {
    setValues((prev) => ({
      ...prev,
      [name]: value === 'on' ? checked : value,
    }))
  }
  const [hadSuccess, setHadSuccess] = useState(false)
  const [hadError, setHadError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmitPlaylist = async (e) => {
    e.preventDefault()
    setLoading(true)
    const playlist = await createPlaylist({
      name,
      description,
      isPublic,
      collaborative,
    })

    setLoading(false)
    if (playlist) {
      setHadSuccess(true)
      setTimeout(() => {
        setHadSuccess(false)
      }, 3000)
    } else {
      setHadError(true)
      setTimeout(() => {
        setHadError(false)
      }, 3000)
    }
  }
  const preventSubmit = !name.length

  return (
    <form
      onSubmit={handleSubmitPlaylist}
      onChange={handleChange}
      className="add-playlist"
      autoComplete="off"
    >
      <fieldset>
        <legend>Create new playlist</legend>
        <Input
          label="Name"
          type="text"
          name="name"
          value={name}
          placeholder="Add a name"
        />
        <Input
          label="Description"
          type="textarea"
          name="description"
          rows="1"
          value={description}
          placeholder="Add an optional description"
        />
        <div>
          <label>
            <span>Public</span>
            <input name="isPublic" type="checkbox" defaultChecked={isPublic} />
          </label>
          <label>
            <span>Collaborative</span>
            <input
              name="collaborative"
              type="checkbox"
              defaultChecked={collaborative}
            />
          </label>
        </div>

        <input
          className="s-submit right"
          disabled={preventSubmit}
          type="submit"
          value="SAVE"
        />
        {loading && '🤞'}
        {hadSuccess && '👍'}
        {hadError && '👎'}
      </fieldset>
    </form>
  )
}
