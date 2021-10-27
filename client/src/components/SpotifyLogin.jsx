import React, { Component } from 'react'
import onClickOutside from 'react-onclickoutside'

import SpotifyLogo from '../images/custom-svgs/SpotifyLogo'
import PartyBlendsLogo from '../images/party-blends.png'
import { checkToken } from '../api/spotify'
import { refreshToken } from 'api/party-playlist'
import { serverFetch } from 'api/utils'
import variables from '../styles/variables'
import { ReactComponent as ChevronACS } from '../images/chevron-ACS.svg'
import { ReactComponent as ChevronDESC } from '../images/chevron-DESC.svg'
import { LOGIN_URL } from '../helpers'
import Menu from '../components/common/s-menu/Menu'

const { colors } = variables

export const styles = {
  container: {
    margin: variables.sizes.md,
  },
  logo: {
    backgroundColor: 'white',
    fill: colors.success,
    stroke: colors.success,
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'relative',
    zIndex: 2,
  },
  dp: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: -20,
    position: 'relative',
  },
  avartarContainer: {
    display: 'flex',
    position: 'relative',
  },
  noLinkStyle: {
    cursor: 'pointer',
    position: 'relative',
    color: 'inherit',
    textDecoration: 'inherit',
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

class SpotifyLogin extends Component {
  state = {
    isLoading: true,
    tokenPresent: null,
    tokenValid: null,

    display_name: null,
    display_picture: null,
    spotifyLink: '',
    openMenu: false,
  }

  async componentDidMount() {
    const { spotifyToken } = sessionStorage
    const { hasAgreed } = localStorage
    if (spotifyToken || hasAgreed === 'true') {
      await this.checkToken(spotifyToken)
    }
    this.setState({ isLoading: false })
    this.setToken()
  }

  setToken = () => {
    const address = window.location.href
    if (address.includes('access_token=')) {
      let access_token = new URLSearchParams(window.location.search).get(
        'access_token'
      )
      let refresh_token = new URLSearchParams(window.location.search).get(
        'refresh_token'
      )
      if (access_token !== 'undefined') {
        sessionStorage.spotifyToken = access_token
        sessionStorage.expiresAt = Date.now() + 3600000
        localStorage.hasAgreed = true
        sessionStorage.refresh_token = refresh_token
      } else {
        localStorage.hasAgreed = false
      }
      window.location.replace(window.origin + window.location.pathname)
    }
  }
  refreshToken = async () => {
    await refreshToken()
    this.render()
  }

  checkToken = async (spotifyToken) => {
    const { onLogIn } = this.props

    if (spotifyToken) {
      try {
        // set User
        let { display_name, email, images, external_urls } = await checkToken(
          spotifyToken
        )
        let display_picture = images.length !== 0 ? images[0].url : null

        this.setState({
          tokenPresent: true,
          tokenValid: true,
          display_name,
          display_picture,
          email,
          spotifyLink: external_urls.spotify,
        })
        onLogIn(true)
        return true
      } catch (error) {
        // timed out or bad token
        // window.location.href = `${LOGIN_URL}?path=${window.location.pathname}`
        this.setState({ tokenPresent: true, tokenValid: false })
        onLogIn(false)
      }
    } else {
      // no token
      this.setState({ tokenPresent: false })
      if (localStorage.hasAgreed) {
        window.location.href = `${LOGIN_URL}?path=${window.location.pathname}`
      }
    }
  }
  setOpenMenu = (openMenu) => {
    this.setState({ openMenu })
  }

  findLogoColor = (tokenPresent, tokenValid) =>
    tokenValid === null
      ? { fill: colors.inactive, stroke: colors.inactive }
      : tokenPresent && tokenValid
      ? { fill: colors.success, stroke: colors.success }
      : { fill: colors.error, stroke: colors.error }

  render() {
    const {
      tokenPresent,
      tokenValid,
      display_picture,
      display_name,
      email,
      openMenu,
      isLoading,
    } = this.state
    const { logo } = this.props

    const logoColor = this.findLogoColor(tokenPresent, tokenValid)

    return (
      <div id="spotify-login" style={styles.container}>
        <div className="pointer" onClick={() => (window.location.href = '/')}>
          {logo ? (
            logo
          ) : (
            <SpotifyLogo style={{ ...styles.logo, ...logoColor }} />
          )}
          {tokenValid && display_picture && (
            <>
              <img src={display_picture} alt="display" style={styles.dp} />
            </>
          )}
        </div>
        {!tokenValid && !isLoading && (
          <a
            style={{ color: 'white' }}
            href={`${LOGIN_URL}?path=${window.location.pathname}`}
          >
            {sessionStorage.getItem('spotifyToken')
              ? 'timed out - login again'
              : `login to spotify`}
          </a>
        )}
        <LoginOut name={display_name ? display_name : email} />
      </div>
    )
  }
}

const clickOutsideConfig = {
  handleClickOutside: () => LoginOut.handleClickOutside,
}
const LoginOut = onClickOutside(({ name }) => {
  const [openMenu, setOpenMenu] = React.useState(false)
  LoginOut.handleClickOutside = () => setOpenMenu(false)

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
        style={openMenu ? { transform: 'rotate(180deg)' } : {}}
      />
      <Menu
        open={openMenu}
        className="logout-menu"
        list={[
          {
            label: 'logout',
            value: 'logout',
            onClick: logout,
          },
        ]}
      />
    </div>
  )
}, clickOutsideConfig)

export default SpotifyLogin
