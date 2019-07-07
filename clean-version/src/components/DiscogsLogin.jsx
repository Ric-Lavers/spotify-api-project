import React, { Component } from 'react'


import SpotifyLogo from '../images/custom-svgs/SpotifyLogo'
import { checkToken } from '../api/spotify'
import variables from '../styles/variables';
import { LOGIN_URL } from '../helpers'
import { styles } from './SpotifyLogin'

const { colors } = variables;


class DiscogsLogin extends Component {

  state={
    tokenPresent: null,
    tokenValid: null,

    display_name: null,
    display_picture:  null,
    spotifyLink: "",
  }

  componentDidMount() {
    // const { discogsToken } = sessionStorage;
    // this.checkToken(discogsToken)
    // this.setToken('oauth_token')
  }

  isTokenPresent = yes => this.setState({ tokenPresent: yes || !!sessionStorage.discogsToken })

  setToken = (tokenName) => {
    let token = new URLSearchParams(window.location.search).get(tokenName)

    if (token) {
      let oauthVerifier = new URLSearchParams(window.location.search).get('oauth_verifier')

      sessionStorage.discogsToken = token
      sessionStorage.oauthVerifier = oauthVerifier
      this.isTokenPresent(true)
      // window.location.replace( window.origin )
    } else {
      this.isTokenPresent()
    }
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

    if ( isLoading ) {
      return <p>...loading</p>
    }

    return (
      <div id="discogs-login" style={styles.container} >
        <p>
          {tokenPresent 
            ? "discogsToken in session storage"
            : "discogsToken in session storage"}
        </p>
      </div>
    )
  }
}


export default DiscogsLogin;