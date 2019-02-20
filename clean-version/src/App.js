import React from 'react';
import { GlobalUiState } from './globalContext'

import logo from './logo.svg';
import hooks from './images/hooks.svg'
import './styles/index.scss';
import SpotifyLogin from './components/SpotifyLogin';
import Player from './components/Player/Player';
import Playlists from './components/playlists/Playlists'

import { useToggle } from './hooks'
import { ReactComponent as GithubLogo } from './images/github-logo.svg'


const App = () => {
  const [ show, toggleShow ] = useToggle(true)
  
  return (
    <GlobalUiState>
      <div className="App">
      <a target="_blank" href="https://github.com/Ric-Lavers/spotify-api-project">
        <GithubLogo/>
      </a>
      <section className="App-header">
        
        <SpotifyLogin/>

          <img src={logo} className="App-logo" alt="logo"
            onClick={toggleShow}/>
          <img src={hooks} alt="logo" className="App-logo hooks" onClick={toggleShow}/>
          <div style={{ display: 'flex' }} >
          {show &&
            <Player visable={show} />}
            <Playlists />
          </div>
        </section>
      </div>
    </GlobalUiState>
  );
}

export default App;
