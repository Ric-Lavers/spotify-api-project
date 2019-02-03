import React, { useState } from 'react';

import logo from './logo.svg';
import './App.css';
import './styles/index.scss';
import SpotifyLogin from './components/SpotifyLogin';
import PlayerAPI from './components/Player/Player';

import Count from './Count';
import CurrentPlaying, { CurrentPlayingContext } from './context'

const App = () => {

  const [ count, setCount ] = useState(0)
 
  return (
    <div className="App">
    <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <SpotifyLogin/>
        <CurrentPlaying>
          <PlayerAPI/>
        </CurrentPlaying>
      </header>
    </div>
  );
}

export default App;
