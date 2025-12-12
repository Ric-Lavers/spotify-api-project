import React from 'react'
import { ReactComponent as ChevronDESC } from '../images/chevron-DESC.svg'
import Menu from '../components/common/s-menu/Menu'

const styles = {
  noLinkStyle: {
    cursor: 'pointer',
    position: 'relative',
    color: 'inherit',
    textDecoration: 'inherit',
    zIndex: 9,
  },
}

const logout = () => {
  const url = ' https://accounts.spotify.com/en/logout'
  const spotifyLogoutWindow = window.open(
    url,
    'Spotify Logout',
    'width=700,height=500,top=40,left=40'
  )
  setTimeout(() => {
    spotifyLogoutWindow.close()
    sessionStorage.clear()
    localStorage.clear()
    window.location.reload()
  }, 1000)
}

const LoginOut = ({ name }) => {
  const [openMenu, setOpenMenu] = React.useState(false)

  if (!name) {
    return null
  }
  return (
    <div
      style={styles.noLinkStyle}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setOpenMenu(!openMenu)
      }}
    >
      {name}{' '}
      <ChevronDESC
        height={12}
        style={
          openMenu
            ? { transform: 'rotate(180deg)' }
            : { transform: 'rotate(0deg)' }
        }
      />
      <Menu
        onClickOutside={() => setOpenMenu(false)}
        open={openMenu}
        className="logout-menu"
        list={[
          {
            label: 'privacy policy',
            value: 'privacy-policy',
            onClick: () => {
              window.location.pathname = 'privacy-policy'
            },
          },
          {
            label: 'logout',
            value: 'logout',
            onClick: logout,
          },
        ]}
      />
    </div>
  )
}

export default LoginOut
