import React, { useState, useEffect } from 'react'
import { removePlaylists, getMePlaylists } from 'api/spotify'
import EmojiLoader from 'components/common/EmojiLoader'

export const PlaylistRemover = () => {
  const [playlists, setPlaylists] = useState([])
  const [checkedPlIds, setChecked] = useState(new Set())
  const [status, setStatus] = useState('')

  useEffect(() => {
    getMePlaylists().then(({ items }) => setPlaylists(items))
  }, [])

  const handleChecked = (id: string, checked: boolean) => {
    checked ? checkedPlIds.add(id) : checkedPlIds.delete(id)
    setChecked(new Set(checkedPlIds))
  }
  const handleRemovePlaylists = async () => {
    setStatus('loading')
    await removePlaylists(Array.from(checkedPlIds))
    await getMePlaylists().then(({ items }) => setPlaylists(items))
    setStatus('')
    window.scrollTo(0, 0)
  }

  return (
    <div className="playlist-remover">
      <div className="checkbox-list">
        {playlists.map(({ id, name }) => (
          <label>
            <input
              id={id}
              defaultChecked={false}
              checked={checkedPlIds.has(id)}
              onChange={({ target: { checked } }) => handleChecked(id, checked)}
              type="checkbox"
            />
            {name}
          </label>
        ))}
      </div>
      <button onClick={handleRemovePlaylists}>DELETE</button>
      <EmojiLoader
        //@ts-ignore
        status={status}
      />
    </div>
  )
}
