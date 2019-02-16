import React from 'react';
import { BrowserContainer } from 'dd-breakpoint-container';

import logo from './logo.svg';
import hooks from './images/hooks.svg'
import './styles/index.scss';
import SpotifyLogin from './components/SpotifyLogin';
import Player from './components/Player/Player';
import { useToggle } from './hooks'

const App = () => {
  const [ show, toggleShow ] = useToggle(true)
  
  return (
    <BrowserContainer>
      <div className="App">
      <header className="App-header">
        
        <SpotifyLogin/>

          <img src={logo} className="App-logo" alt="logo"
            onClick={toggleShow}/>
          <img src={hooks} alt="logo" className="App-logo hooks" onClick={toggleShow}/>
        {show &&
          <Player visable={show} />}
        </header>
      </div>
    </BrowserContainer>
  );
}

export default App;
