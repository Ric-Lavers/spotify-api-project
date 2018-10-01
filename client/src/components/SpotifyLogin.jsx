import React, { Component } from 'react'

import SpotifyLogo from '../images/svgs/SpotifyLogo'
import { checkToken } from '../api/spotify'

const styles = {
  logo: {
    backgroundColor: 'white',
    fill: 'blue',
    stroke: 'blue',
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
    zIndex: -1,
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
    displayPicture:  null,
  }

  async componentDidMount(){
    if (localStorage.spotifyToken){
      this.setState({tokenPresent: true})
      try {
        let res = await checkToken(localStorage.spotifyToken)
        let { display_name, email } = res
        let displayPicture = res.images.length !== 0
          ? res.images[0].url
          : null
        this.setState({ tokenValid: true, display_name, displayPicture, email })
      } catch (error) {
        // the token has timed out
        this.setState({ tokenValid: false })

      }
     
    } else {
      window.location.href = 'http://localhost:4000/login'
      this.setState({tokenPresent: false})
    }
    
  }

  render() {
    let { tokenPresent, tokenValid, displayPicture, display_name, email} = this.state
    let logoColor = (tokenValid ===  null)
      ? {fill: 'grey', stroke: 'grey'}
      : (tokenPresent && tokenValid)
        ? {fill: 'blue', stroke: 'blue'}
        : {fill: 'red', stroke: 'red'}



    return (
      <div>
        <div> 
          <SpotifyLogo style={Object.assign({}, styles.logo, logoColor)}/>
          {tokenValid && displayPicture &&
            <img src={displayPicture} alt="" style={styles.dp}/>
          }
        </div>
        <p>{display_name?display_name:email}</p>
        { !tokenValid &&
          <a href="http://localhost:4000/login">
            {tokenPresent
              ? `spotify auth timed out login again`
              : `login to spotify`}    
          </a>
        }      
      </div>
    )
  }
}


export default SpotifyLogin;