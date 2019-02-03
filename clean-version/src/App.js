import React, { useState } from 'react';

import logo from './logo.svg';
import './App.css';
import './styles/index.scss';
import SpotifyLogin from './components/SpotifyLogin';
import Player from './components/Player/Player';

import CurrentPlaying, { CurrentPlayingContext } from './context'

const App = () => {

  const [ show, setShow ] = useState(true)
 
  return (
    <div className="App">
    <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" onClick={() => setShow(!show)}/>
        <SpotifyLogin/>
        {show &&
        <Player/>}
        
      </header>
    </div>
  );
}

export default App;
