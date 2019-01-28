import React, { Component } from 'react'

import SpotifyLogo from '../images/custom-svgs/SpotifyLogo'
import { checkToken } from '../api/spotify'
import variables from '../styles/variables';

let REACT_APP_LOGIN_URL;
if (process.env.REACT_APP_ENV === 'PROD') {
  REACT_APP_LOGIN_URL= process.env.REACT_APP_LOGIN_URL_PROD
}else {
  REACT_APP_LOGIN_URL= process.env.REACT_APP_LOGIN_URL_DEV || 'http://localhost:4000/login'
}

const { colors } = variables;

const styles = {
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
  }
}

class SpotifyLogin extends Component {

  state={
    tokenPresent: null,
    tokenValid: null,

    display_name: null,
    display_picture:  null,
  }

  componentDidMount() {
    const { spotifyToken } = localStorage;
    
    this.checkToken(spotifyToken)
    this.setToken()
  }

  setToken = () => {
    const address = window.location.href
    if ( address.includes('access_token=') ) {
      let token=  new URLSearchParams(window.location.search).get('access_token')

      console.log('got token')
      localStorage.spotifyToken = token
      window.location.replace( window.origin )
    }
  }

  checkToken = async spotifyToken => {
    if (spotifyToken){
      this.setState({tokenPresent: true})
      try {// set User
        let { display_name, email, images } = await checkToken( spotifyToken )
        let display_picture = images.length !== 0
          ? images[0].url
          : null

        this.setState({ tokenValid: true, display_name, display_picture, email })
        return true
      } catch (error) { // timed out
        this.setState({ tokenValid: false })
      }
     
    } else { // no token
      this.setState({tokenPresent: false})
      window.location.href = REACT_APP_LOGIN_URL
    } 
  }

  findLogoColor = (tokenPresent, tokenValid) => 
    (tokenValid ===  null)
    ? {fill: colors.inactive, stroke: colors.inactive}
    : (tokenPresent && tokenValid)
      ? {fill: colors.success, stroke: colors.success}
      : {fill: colors.error, stroke: colors.error}
  

  render() {
    const {
      tokenPresent,
      tokenValid,
      display_picture,
      display_name,
      email,
    } = this.state
    const { isLoading } = this.props

    const logoColor = this.findLogoColor(tokenPresent, tokenValid)
console.log(tokenValid , display_picture)
    if ( isLoading ) {
      return <p>...loading</p>
    }

    return (
      <div id="spotify-login" >
        <div>
          <SpotifyLogo style={{ ...styles.logo, ...logoColor }}/>
    { tokenValid && display_picture &&
            <img src={display_picture} alt="display picture" style={styles.dp}/>}
        </div>
        <p>
          {display_name?display_name:email}
        </p>
    { !tokenValid &&
        <a href={REACT_APP_LOGIN_URL}>
          {tokenPresent
            ? `spotify auth timed out login again`
            : `login to spotify`}    
        </a>}      
      </div>
    )
  }
}


export default SpotifyLogin;