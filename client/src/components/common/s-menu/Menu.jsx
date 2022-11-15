import React, { useState, useEffect } from 'react'
import onClickOutside from 'react-onclickoutside'

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
    if (!isParent) {
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

class Menu extends React.Component {
  handleClickOutside = () =>
    this.props.onClickOutside && this.props.onClickOutside(false)

  render() {
    const {
      list,
      onClick,
      currentPlaylistId,
      open,
      isChild = false,
    } = this.props
    if (!open) {
      return null
    }

    return (
      <>
        <div
          id="context-menu"
          className={`${isChild ? 's-menu-child' : 's-menu'} ${
            open && 'open'
          } `}
        >
          <ul tabindex="0" role="menu">
            {list.map(({ label, value, list }) => (
              <li key={value} role="presentation">
                <MenuButton
                  onClick={onClick}
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
}
const clickOutsideConfig = {
  handleClickOutside: () => Menu.handleClickOutside,
}

export default Menu //onClickOutside(Menu, clickOutsideConfig)
