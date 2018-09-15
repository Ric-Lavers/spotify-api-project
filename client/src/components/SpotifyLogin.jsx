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
    tokenPresent: false,
    tokenValid: false,

    display_name: null,
    displayPicture:  null,
  }

  async componentDidMount(){
    if (localStorage.spotifyToken){
      this.setState({tokenPresent: true})
      try {
        let res = await checkToken(localStorage.spotifyToken)
        let { display_name } = res
        let displayPicture = res.images.length !== 0
          ? res.images[0].url
          : null
        this.setState({ tokenValid: false, display_name, displayPicture })
      } catch (error) {
        this.setState({ tokenValid: false })
      }
     
    } else {
      this.setState({tokenPresent: false})
    }
    
  }

  render() {
    let { tokenPresent, tokenValid, displayPicture, display_name} = this.state
    let logoColor = tokenPresent 
      ? {fill: 'blue', stroke: 'blue'}
      : {fill: 'red', stroke: 'red'}

    return (
      <div>
        <div> 
          <SpotifyLogo style={Object.assign({}, styles.logo, logoColor)}/>
          <img src={displayPicture} alt="" style={styles.dp}/>
        </div>
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