import React, { useState, useEffect } from 'react'
import { ReactComponent as MoreChevron } from 'images/spotify-menu-more.svg'

const MenuButton = ({
  onClick,
  label,
  value,
  currentPlaylistId,
  isParent = false,
}) => {
  return (
    <button onClick={() => onClick(value)} role="menuitem" tabindex="-1">
      <span
        className={currentPlaylistId === value ? 'highlight' : ''}
        as="span"
        dir="auto"
      >
        {label}
      </span>
      {isParent && (
        <span>
          <MoreChevron />
        </span>
      )}
    </button>
  )
}

const Menu = ({ list, onClick, currentPlaylistId, open }) => {
  return (
    <>
      <div
        id="context-menu"
        className={`s-menu ${open &&
          'open'}`} /* data-placement="bottom-start" */
      >
        <ul tabindex="0" role="menu">
          {list.map(({ label, value }) => (
            <li key={value} role="presentation">
              <MenuButton
                onClick={onClick}
                label={label}
                value={value}
                currentPlaylistId={currentPlaylistId}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default Menu
