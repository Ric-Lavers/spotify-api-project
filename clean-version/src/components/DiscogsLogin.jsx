import React, { Component } from 'react'


import SpotifyLogo from '../images/custom-svgs/SpotifyLogo'
import { identity } from '../api/discogs'
import variables from '../styles/variables';
import { LOGIN_URL } from '../helpers'
import { styles } from './SpotifyLogin'

const { colors } = variables;

const apiAuth = [
  'consumerKey',
  'consumerSecret',
  'token',
  'tokenSecret',
]



class DiscogsLogin extends Component {

  state={
    tokenPresent: null,
    tokenValid: null,

    display_name: null,
    display_picture:  null,
    spotifyLink: "",
    data: "",
  }

  componentDidMount() {
    // const { discogsToken } = sessionStorage;
    // this.checkToken(discogsToken)
    this.setToken()
  }

  isTokenPresent = yes => this.setState({ tokenPresent: yes || !!sessionStorage.discogsToken })

  setToken = (tokenName) => {
    let urlParams = new URLSearchParams(window.location.search)


    if (urlParams.get('consumerKey') === 'zWqDQEdZNBUyXWjTcySJ' ) {
      apiAuth.forEach(key => {
        sessionStorage.setItem(
          `discogs${key.charAt(0).toUpperCase()}${key.slice(1)}`,
          urlParams.get(key)
        )
      });

      this.isTokenPresent(true)
      // window.location.replace( window.origin )
    } else {
      this.isTokenPresent()
    }
  }

  getIdentity = async(e) => {
    e.preventDefault()

    const data = await identity()
console.log(data)
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

    if ( isLoading ) {
      return <p>...loading</p>
    }

    return (
      <div id="discogs-login" style={styles.container} >
        <button onClick={this.getIdentity} >
          identity
        </button>
        <p>
          {tokenPresent 
            ? "discogsToken in session storage"
            : "discogsToken in session storage"}
        </p>
        { JSON.stringify(this.state.data) }
      </div>
    )
  }
}


export default DiscogsLogin;