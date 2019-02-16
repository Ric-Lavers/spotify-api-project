import React from 'react';

import logo from './logo.svg';
import hooks from './images/hooks.svg'
import './styles/index.scss';
import SpotifyLogin from './components/SpotifyLogin';
import Player from './components/Player/Player';
import { useToggle } from './hooks'
import { ReactComponent as GithubLogo } from './images/github-logo.svg'

const App = () => {
  const [ show, toggleShow ] = useToggle(true)
  
  return (
    <div className="App">
    <a target="_blank" href="https://github.com/Ric-Lavers/spotify-api-project">
      <GithubLogo/>
    </a>
    <header className="App-header">
      
      <SpotifyLogin/>

        <img src={logo} className="App-logo" alt="logo"
          onClick={toggleShow}/>
        <img src={hooks} alt="logo" className="App-logo hooks" onClick={toggleShow}/>
      {show &&
        <Player visable={show} />}
      </header>
    </div>
  );
}

export default App;
