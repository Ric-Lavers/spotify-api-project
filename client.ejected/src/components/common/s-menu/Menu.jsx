import React, { useState, useEffect } from 'react'

import { ReactComponent as MoreChevron } from 'images/spotify-menu-more.svg'

const MenuButton = ({
  onClick,
  label,
  value,
  currentPlaylistId,
  list,
  open,
}) => {
  const isParent = !!list
  const [childOpen, setOpenChild] = useState(false)
  const handleClick = () => {
    if (!isParent && onClick) {
      onClick(value)
    } else {
      setOpenChild(!childOpen)
    }
  }

  return (
    <>
      <button onClick={() => handleClick()} role="menuitem" tabindex="-1">
        <span
          className={currentPlaylistId === value ? 'highlight' : ''}
          as="span"
          dir="auto"
        >
          {label}
        </span>
        {isParent && (
          <span>
            <MoreChevron
              style={childOpen ? { transform: 'rotate(180deg)' } : {}}
            />
          </span>
        )}
      </button>
      {isParent && childOpen && (
        <Menu isChild open={childOpen} list={list} onClick={onClick} />
      )}
    </>
  )
}
function useOutsideAlerter(ref, onClickOutside) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClickOutside()
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, onClickOutside])
}
const Menu = ({
  list,
  onClick,
  currentPlaylistId,
  open,
  onClickOutside = () => {},
  isChild = false,
  className = '',
}) => {
  const wrapperRef = React.useRef(null)
  useOutsideAlerter(wrapperRef, onClickOutside)
  if (!open) {
    return null
  }
  return (
    <>
      <div
        ref={wrapperRef}
        id="context-menu"
        className={`${isChild ? 's-menu-child' : 's-menu'} ${
          open && 'open'
        } ${className}`}
      >
        <ul tabindex="0" role="menu">
          {list.map(({ label, value, list, onClick: _onClick }) => (
            <li key={value} role="presentation">
              <MenuButton
                onClick={_onClick || onClick}
                label={label}
                value={value}
                currentPlaylistId={currentPlaylistId}
                list={list}
                open={open}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default Menu
