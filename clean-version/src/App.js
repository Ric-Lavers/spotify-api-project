import React from 'react';
import { GlobalUiState, GlobalContext } from './globalContext'

import logo from './logo.svg';
import hooks from './images/hooks.svg'
import './styles/_index.scss';
import SpotifyLogin from './components/SpotifyLogin';
import Player from './components/Player/Player';
import Playlists from './components/playlists/Playlists'

import { useToggle } from './hooks'
import { ReactComponent as GithubLogo } from './images/github-logo.svg'

const Section = ({ children }) => {
  const [ state ] = React.useContext(GlobalContext)
  console.log(state)
  return <section style={{
    backgroundImage: `url(${state.currentPlaying.image.src})`,
    backgroundPosition: 'top',
  }} className="App-header" >{ children }</section>
}

const App = () => {
  const [ show, toggleShow ] = useToggle(true)
  
  return (
    <GlobalUiState>
      
      <div className="App">
      <a target="_blank" href="https://github.com/Ric-Lavers/spotify-api-project">
        <GithubLogo/>
      </a>
      <Section>
        
        <SpotifyLogin/>

          <img src={logo} className="App-logo" alt="logo"
            onClick={toggleShow}/>
          <img src={hooks} alt="logo" className="App-logo hooks" onClick={toggleShow}/>
          <div style={{ display: 'flex' }} >
          {show &&
            <Player visable={show} />}
            <Playlists />
          </div>
        </Section>
      </div>
    </GlobalUiState>
  );
}



export default App;
