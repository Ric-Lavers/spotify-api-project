import React, { Component } from 'react'

import SpotifyLogo from '../images/custom-svgs/SpotifyLogo'
import { checkToken } from '../api/spotify'
import { refreshToken } from 'api/party-playlist'
import variables from '../styles/variables'

import { LOGIN_URL } from '../helpers'
import LogOutMenu from './LogoutMenu'
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
        <LogOutMenu name={display_name ? display_name : email} />
      </div>
    )
  }
}

export default SpotifyLogin
