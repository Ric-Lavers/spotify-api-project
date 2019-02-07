import React, { useState } from 'react';

import { play } from './api/spotify'
import logo from './logo.svg';
import './App.css';
import './styles/index.scss';
import SpotifyLogin from './components/SpotifyLogin';
import Player from './components/Player/Player';

// import CurrentPlaying, { CurrentPlayingContext } from './context'

const App = () => {

  const [ show, setShow ] = useState(true)
 
  return (
    <div className="App">
    <header className="App-header">
      <SpotifyLogin/>
      <img src={logo} className="App-logo" alt="logo"
        onClick={() => setShow(!show)}/>
  {show &&
      <Player visable={show} />}
        
      </header>
      <p onClick={() => play({"context_uri": "spotify:album:6uSZWWohd10kPpyFWx6xz9"})}>play errors</p>
    </div>
  );
}

export default App;
