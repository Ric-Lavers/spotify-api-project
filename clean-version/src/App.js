import React, { useState } from 'react';

import { play } from './api/spotify'
import logo from './logo.svg';
import hooks from './images/hooks.svg'
import './styles/index.scss';
import SpotifyLogin from './components/SpotifyLogin';
import Player from './components/Player/Player';
import { relative } from 'upath';
// import Search from './components/Player/Search';

// import CurrentPlaying, { CurrentPlayingContext } from './context'

const App = () => {

  const [ show, setShow ] = useState(true)
 
  return (
    <div className="App">
    <header className="App-header">
      <SpotifyLogin/>

        <img src={logo} className="App-logo" alt="logo"
          onClick={() => setShow(!show)}/>
        <img src={hooks} className="App-logo hooks"/>

  {show &&
      <Player visable={show} />}
        
      </header>
    </div>
  );
}

export default App;
