import React, { useState } from 'react';

import logo from './logo.svg';
import hooks from './images/hooks.svg'
import './styles/index.scss';
import SpotifyLogin from './components/SpotifyLogin';
import Player from './components/Player/Player';

const App = () => {//37 line component (66% of the class componen)
  const [ show, setShow ] = useState(true)

  return (
    
      <div className="App">
      <header className="App-header">
        <SpotifyLogin/>

          <img src={logo} className="App-logo" alt="logo"
            onClick={() => setShow(!show)}/>
          <img src={hooks} alt="logo" className="App-logo hooks" onClick={() => setShow(!show)}/>
        {show &&
          <Player visable={show} />}
        </header>
      </div>
    
  );
}

export default App;
