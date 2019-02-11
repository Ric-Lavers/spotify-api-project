import React, { useState } from 'react';

import logo from './logo.svg';
import hooks from './images/hooks.svg'
import './styles/index.scss';
import SpotifyLogin from './components/SpotifyLogin';
import Player from './components/Player/Player';
import { useWindowWidth, withWindowWidth, WindowWidthWrapper } from './hooks'

const App = ({ widthHOC }) => {
  const [ show, setShow ] = useState(false)
  const width = useWindowWidth()
  return (
      <div className="App">
      <header className="App-header">
        
        <SpotifyLogin/>

          <img src={logo} className="App-logo" alt="logo"
            onClick={() => setShow(!show)}/>
          <img src={hooks} alt="logo" className="App-logo hooks" onClick={() => setShow(!show)}/>
         <WindowWidthWrapper>
            { width => (
              `window width is:  ${width}`
            )}
          </WindowWidthWrapper><br/>
          window width is: {widthHOC}<br/>
          window width is: {width}
        {show &&
          <Player visable={show} />}
        </header>
      </div>
    
  );
}

export default withWindowWidth(App);
