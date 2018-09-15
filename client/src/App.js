import React, { Component } from 'react';
import './App.css';

class App extends Component {

  state={
    spotifyIds: "",
  }

  handleSubmit = event => {
    event.preventDefault();
    console.log( 'SUBMIT' )
  }

  handleChange = ({name, value}) => {
    let newValue = value.replace(/https:\/\/open.spotify.com\/track\//g, '').split('\n')
    this.setState({[name]: newValue})
  }

  componentDidMount(){
    const address = window.location.href
    if ( address.includes('access_token=') ) {
      const token = address.replace('http://localhost:3000/?access_token=', '')
      console.log('got token')
      localStorage.spotifyToken = 'BQDA8SCkGHMKtkJpdRosbBK10Pf5zJ1PUei6inpwBS4AKFLeI2TMnD1qQXdB3iDOXu16nF7ESMOpoq9rtxglrQlotAJvSsaLhsRRKnS_EGvu7Dmw0Ie66rkcVnhy4r1Ax2aqSzhhVFLtBCYTvxpAePO-SUCdvriczDEj'
    }
  }

  render() {
    return (
      <div className="App">
       <h1>Spotify playlists</h1>

        <a href="http://localhost:4000/login">
          login to spotify
        </a>

        <form 
          onSubmit={this.handleSubmit}
          onChange={({target}) => this.handleChange(target)}
        >
          <textarea
            rows="4" cols="50"
            name="spotifyIds" 
            value={this.state.value} 
          />
          <input type="submit"/>
        </form>
        {JSON.stringify(this.state)}
      </div>
    );
  }
}

export default App;
