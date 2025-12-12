import React, { useState, memo, useEffect } from 'react'
import { useSkipTrack } from '../../hooks/useSkipTrack'
import Plus from './Plus'
import Minus from './Minus'
import DragBox from '../DragBox'

//TODO move out
const SpCheckbox = ({ active, onToggle }) => {
  const [_active, setActive] = useState(active)

  const handleToggleActive = () => {
    setActive((p) => !p)
    onToggle && onToggle(!_active)
  }

  return (
    <div className="sp-checkbox">
      <input
        type="checkbox"
        name="ToggleTailored ads"
        className="hidden"
        checked={active}
      />
      <span onClick={handleToggleActive} className="check-wrapper">
        <span className="circle"></span>
      </span>
    </div>
  )
}

//TODO ?refactor then move
const Tabs = ({
  children: ToggleInactive,
  tabList = [
    { label: 'Skip list', id: 'skipList', content: <>skip list content</> },
    {
      label: 'Add current',
      id: 'addCurrent',
      content: <>add current content</>,
    },
  ],
}) => {
  const useWithLocal = () => {
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

  const [openTab, setOpenTab] = useWithLocal()
  let hideToggle = false
  const CurrentTab = (() => {
    try {
      return tabList.find(({ id }) => id === openTab).content
    } catch (_) {
      hideToggle = true
      return <></>
    }
  })()

  return (
    <div className="tabs">
      <nav className="tabs-menu">
        {tabList.map(({ label, id, onClick = () => void {} }) => (
          <button
            key={`${id}-tab`}
            className={id === openTab ? 'active' : ''}
            onClick={() => {
              setOpenTab(id)
              onClick(id, { openTab })
            }}
          >
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="quick-actions">
        {!hideToggle && <>{ToggleInactive}</>}
      </div>
      <div className="tabs-content">{CurrentTab}</div>
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
    toggleVisiblitySkipList,
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
      {
        label: 'X',
        id: 'minimize',
        onClick: (id, { openTab }) => {
          if (openTab === id) {
            toggleVisiblitySkipList()
          }
        },
      },
    ]

    return (
      <div className="skip-list ">
        <Tabs tabList={tabList}>
          <SpCheckbox active={skipList.active} onToggle={toggleSkipList} />
        </Tabs>
      </div>
    )
  }
)

const SkipListData = () => {
  const {
    genres,
    artists,
    track,
    currentTrack,
    skipList,
    addToSkipList,
    removeFromSkipList,
    toggleSkipList,
    toggleVisiblitySkipList,
    isVisible,
  } = useSkipTrack()

  return isVisible ? (
    <>
      <DragBox>
        <SkipList
          currentTrack={currentTrack}
          skipList={skipList}
          addToSkipList={addToSkipList}
          removeFromSkipList={removeFromSkipList}
          toggleSkipList={toggleSkipList}
          toggleVisiblitySkipList={toggleVisiblitySkipList}
          genres={genres}
          artists={artists}
          track={track}
        />
      </DragBox>
    </>
  ) : null
}

export default memo(SkipListData)
