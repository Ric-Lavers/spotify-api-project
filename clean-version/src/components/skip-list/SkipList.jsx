import React, { useState, memo, useEffect } from 'react'
import { useSkipTrack } from '../../hooks/useSkipTrack'
import Plus from './Plus'
import Minus from './Minus'

const SpCheckbox = ({ active, onToggle }) => {
  const [_active, setActive] = useState(active)

  const handleToggleActive = () => {
    setActive((p) => !p)
    onToggle && onToggle(!_active)
  }

  return (
    <>
      <label className="sp-checkbox">
        <input
          type="checkbox"
          name="ToggleTailored ads"
          className="hidden"
          checked={active}
          onClick={handleToggleActive}
        ></input>
        <span className="check-wrapper">
          <span className="circle"></span>
        </span>
      </label>
    </>
  )
}

const Tabs = ({
  children: ActiveToggle,
  tabList = [
    { label: 'Skip list', id: 'skipList', content: <>skip list content</> },
    {
      label: 'Add current',
      id: 'addCurrent',
      content: <>add current content</>,
    },
  ],
}) => {
  const withLocal = () => {
    const [openTab, setOpenTab] = useState(
      localStorage.getItem('OPEN_TAB') || tabList[0].id
    )

    useEffect(
      function OPEN_TABtoLocal() {
        localStorage.setItem('OPEN_TAB', openTab)
      },
      [openTab]
    )

    return [openTab, setOpenTab]
  }

  const [openTab, setOpenTab] = withLocal()

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
        <>{ActiveToggle}</>
        {tabList.find(({ id }) => id === openTab).content}
      </div>
    </div>
  )
}

const SkipRows = ({
  title,
  list,
  skipType,
  onClick,
  isAdd,
  isRemove,
  skipList,
}) => {
  const [open, setOpen] = useState(false)
  return (
    <div className={isRemove ? 'row is-collapsable' : 'row'}>
      <h5 onClick={() => setOpen((p) => !p)} className={open ? 'DESC' : 'ASC'}>
        {title}
      </h5>

      <ul style={{ ...(open && { display: 'none' }) }}>
        {list.map(({ id, name }) => {
          const currentId = [id, name].join(' - ')
          const isActive = skipList[skipType].has(currentId)
          return (
            <li key={id} className="row">
              <span>{name} </span>
              <span>
                {isAdd && (
                  <Plus
                    onClick={() => onClick(skipType, currentId)}
                    inactive={isActive}
                  />
                )}
                {isRemove && (
                  <Minus onClick={() => onClick(skipType, currentId)} />
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const SkipList = memo(
  ({
    genres,
    artists,
    track,
    currentTrack,
    skipList,
    addToSkipList,
    removeFromSkipList,
    toggleSkipList,
  }) => {
    const AddCurrent = (/* {
      artists,
    genres,
      track,
    addToSkipList,
    skipList,
    } */) => {
      return (
        <div>
          <SkipRows
            isAdd
            title="track"
            skipType="tracks"
            list={[track]}
            onClick={addToSkipList}
            skipList={skipList}
          />
          <SkipRows
            isAdd
            title="artists"
            skipType="artists"
            list={artists}
            onClick={addToSkipList}
            skipList={skipList}
          />
          <SkipRows
            isAdd
            title="genres"
            skipType="genres"
            list={genres.map((g) => ({ id: g, name: g }))}
            onClick={addToSkipList}
            skipList={skipList}
          />
        </div>
      )
    }

    const SkippingList = () => {
      return (
        <>
          <SkipRows
            isRemove
            title="tracks"
            skipType="tracks"
            list={[...skipList.tracks].map((t) => {
              const [id, name] = t.split(' - ')
              return { id, name }
            })}
            onClick={removeFromSkipList}
            skipList={skipList}
          />
          <SkipRows
            isRemove
            title="artists"
            skipType="artists"
            list={[...skipList.artists].map((t) => {
              const [id, name] = t.split(' - ')
              return { id, name }
            })}
            onClick={removeFromSkipList}
            skipList={skipList}
          />
          <SkipRows
            isRemove
            title="genres"
            skipType="genres"
            list={[...skipList.genres].map((t) => {
              const [id, name] = t.split(' - ')
              return { id, name }
            })}
            onClick={removeFromSkipList}
            skipList={skipList}
          />
        </>
      )
    }

    const tabList = [
      { label: 'Skip list', id: 'skipList', content: <SkippingList /> },
      {
        label: 'Add current',
        id: 'addCurrent',
        content: <AddCurrent />,
      },
    ]

    return (
      <div className="skip-list">
        <Tabs tabList={tabList}>
          <SpCheckbox active={skipList.active} onToggle={toggleSkipList} />
        </Tabs>
      </div>
    )
  }
)

const withData = () => {
  const {
    genres,
    artists,
    track,
    currentTrack,
    skipList,
    addToSkipList,
    removeFromSkipList,
    toggleSkipList,
  } = useSkipTrack()

  return (
    <SkipList
      currentTrack={currentTrack}
      skipList={skipList}
      addToSkipList={addToSkipList}
      removeFromSkipList={removeFromSkipList}
      toggleSkipList={toggleSkipList}
      genres={genres}
      artists={artists}
      track={track}
    />
  )
}

export default memo(withData)
