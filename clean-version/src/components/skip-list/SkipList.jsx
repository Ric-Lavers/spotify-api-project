import React, { useState, memo } from 'react'
import { useSkipTrack } from '../../hooks/useSkipTrack'
import Plus from './Plus'
import Minus from './Minus'

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
  const [openTab, setOpenTab] = useState(tabList[0].id)

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
        {list.map(({ id, name }) => (
          <li key={id} className="row">
            <span>{name} </span>
            <span>
              {isAdd && (
                <Plus
                  onClick={() => onClick(skipType, [id, name].join(' - '))}
                  inactive={skipList[skipType].has([id, name].join(' - '))}
                />
              )}
              {isRemove && (
                <Minus
                  onClick={() => onClick(skipType, [id, name].join(' - '))}
                />
              )}
            </span>
          </li>
        ))}
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
  }) => {
    const AddCurrent = () => {
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
          {/*   <details>
            <summary>tracks</summary>
            {[...skipList.tracks].map((track) => {
              const [id, name] = track.split(' - ')
              return <p>{name}</p>
            })}
          </details>
          <details open>
            <summary>artists</summary>

            <ul>
              <li className="row">
                <span>{track.name}</span>
                <span>
                  <Minus
                    onClick={() =>
                      addToSkipList(
                        'tracks',
                        [track.id, track.name].join(' - ')
                      )
                    }
                    inactive={skipList.tracks.has(
                      [track.id, track.name].join(' - ')
                    )}
                  />
                </span>
              </li>
            </ul>
          </details>
          <details>
            <summary>genres</summary>
            {[...skipList.genres].map((genre) => {
              return <p>{genre}</p>
            })}
          </details> */}
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
        <Tabs tabList={tabList} />
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
  } = useSkipTrack()

  return (
    <SkipList
      currentTrack={currentTrack}
      skipList={skipList}
      addToSkipList={addToSkipList}
      removeFromSkipList={removeFromSkipList}
      genres={genres}
      artists={artists}
      track={track}
    />
  )
}

export default memo(withData)
