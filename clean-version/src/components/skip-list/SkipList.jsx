import React, { useState, useContext, memo } from 'react'
import { useSkipTrack } from '../../hooks/useSkipTrack'
import { CurrentPlayingContext } from '../../context'
import { GlobalContext } from '../../globalContext'

const Plus = ({ onClick, inactive = false }) => (
  <div
    onClick={() => !inactive && onClick()}
    className={`plus ${inactive ? 'disabled' : ''}`}
  >
    <svg
      role="img"
      height="12"
      width="12"
      viewBox="0 0 16 16"
      style={{ fill: 'currentcolor' }}
    >
      <path d="M14 7H9V2H7v5H2v2h5v5h2V9h5z"></path>
      <path fill="none" d="M0 0h16v16H0z"></path>
    </svg>
  </div>
)

const Tabs = ({
  tabList = [
    { label: 'Skip list', id: 'skipList', content: <>skip list content</> },
    {
      label: 'Add current',
      id: 'addCurrent',
      content: <>add current content</>,
    },
  ],
}) => {
  const [openTab, setOpenTab] = useState(tabList[1].id)

  return (
    <div className="tabs">
      <nav className="tabs-menu">
        {tabList.map(({ label, id }) => (
          <button
            key={`${id}-tab`}
            className={id === openTab ? 'active' : ''}
            onClick={() => setOpenTab(id)}
          >
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="tabs-content">
        {tabList.find(({ id }) => id === openTab).content}
      </div>
    </div>
  )
}

const SkipList = ({
  currentTrack,
  skipList,
  addToSkipList,
  removeToSkipList,
}) => {
  const { genres, artists, track } = useSkipTrack(currentTrack)

  const AddCurrent = () => {
    return (
      <div>
        <div className="row">
          <h5>track</h5>
          <ul>
            <li className="row">
              <span>{track.name}</span>
              <span>
                <Plus
                  onClick={() => addToSkipList('tracks', track.id)}
                  inactive={skipList.tracks.has(track.id)}
                />
              </span>
            </li>
          </ul>
        </div>
        <div className="row">
          <h5>artists</h5>
          <ul>
            {artists.map(({ id, name }) => (
              <li key={id} className="row">
                <span>{name} </span>
                <span>
                  <Plus
                    onClick={() => addToSkipList('artists', id)}
                    inactive={skipList.artists.has(id)}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="row">
          <h5>genres</h5>
          <ul>
            {genres.map((genre) => {
              return (
                <li key={genre} className="row">
                  <span>{genre} </span>
                  <span>
                    <Plus
                      onClick={() => addToSkipList('genres', genre)}
                      inactive={skipList.genres.has(genre)}
                    />
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    )
  }

  const tabList = [
    { label: 'Skip list', id: 'skipList', content: <>skip list content</> },
    {
      label: 'Add current',
      id: 'addCurrent',
      content: <AddCurrent />,
    },
  ]

  return (
    <div className="skip-list">
      <Tabs tabList={tabList} />
    </div>
  )
}

const withData = () => {
  const currentTrack = useContext(CurrentPlayingContext)
  const [{ skipList }, dispatch] = useContext(GlobalContext)
  const addToSkipList = (skipType, id) => {
    localStorage.setItem(
      `skipList.${skipType}`,
      JSON.stringify([...skipList[skipType], id])
    )
    dispatch({
      type: 'skipList/add',
      skipType,
      id,
    })
  }
  const removeToSkipList = (skipType, id) => {
    localStorage.setItem(
      `skipList.${skipType}`,
      JSON.stringify([...skipList[skipType]].filter((x) => x !== id))
    )
    dispatch({
      type: 'skipList/remove',
      skipType,
      id,
    })
  }

  return (
    <SkipList
      currentTrack={currentTrack}
      skipList={skipList}
      addToSkipList={addToSkipList}
      removeToSkipList={removeToSkipList}
    />
  )
}

export default memo(withData)
