import React, { Component } from 'react'

import { identity } from '../api/discogs'

import { styles } from './SpotifyLogin'

const apiAuth = ['consumerKey', 'consumerSecret', 'token', 'tokenSecret']

class DiscogsLogin extends Component {
  state = {
    tokenPresent: null,
    tokenValid: null,

    display_name: null,
    display_picture: null,
    spotifyLink: '',
    data: '',
  }

  componentDidMount() {
    // const { discogsToken } = sessionStorage;
    // this.checkToken(discogsToken)
    this.setToken()
  }

  isTokenPresent = (yes) =>
    this.setState({ tokenPresent: yes || !!sessionStorage.discogsToken })

  setToken = (tokenName) => {
    let urlParams = new URLSearchParams(window.location.search)

    if (urlParams.get('consumerKey') === 'zWqDQEdZNBUyXWjTcySJ') {
      apiAuth.forEach((key) => {
        sessionStorage.setItem(
          `discogs${key.charAt(0).toUpperCase()}${key.slice(1)}`,
          urlParams.get(key)
        )
      })

      this.isTokenPresent(true)
      // window.location.replace( window.origin )
    } else {
      this.isTokenPresent()
    }
  }

  getIdentity = async (e) => {
    e.preventDefault()

    const data = await identity()
    data && this.setState({ data })
  }

  render() {
    const {
      tokenPresent,
      //   tokenValid,
      //   display_picture,
      //   display_name,
      //   email,
      //   spotifyLink,
    } = this.state
    const { isLoading } = this.props

    if (isLoading) {
      return <p>...loading</p>
    }

    return (
      <div id="discogs-login" style={styles.container}>
        <button onClick={this.getIdentity}>identity</button>
        <p>
          {tokenPresent
            ? 'discogsToken in session storage'
            : 'discogsToken in session storage'}
        </p>
      </div>
    )
  }
}

export default DiscogsLogin
