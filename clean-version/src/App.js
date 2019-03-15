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


const App = () => {
  
  
  return (
    <GlobalUiState>
      <MainPage/>
    </GlobalUiState>
  );
}

const MainPage = () => {
  const [ show, toggleShow ] = useToggle(true)
  const [ state, dispatch ] = React.useContext(GlobalContext)

  const handleSetLogin = payload => {
    dispatch({
      type: 'user/loginSpotify',
      payload,
    })
  }

  return (
    <div className="App">
      <a target="_blank" href="https://github.com/Ric-Lavers/spotify-api-project">
        <GithubLogo/>
      </a>
      <section 
        className="App-header"
        style={{
          backgroundImage: `url(${state.currentPlaying.image.src})`,
          backgroundPosition: 'top',
        }} >

        <SpotifyLogin onLogIn={handleSetLogin}/>
        <img src={logo} className="App-logo" alt="logo"
          onClick={toggleShow}/>
        <img src={hooks} alt="logo" className="App-logo hooks" onClick={toggleShow}/>
        <div style={{ display: 'flex' }} >
        {show && state.isSpotifyLoggedIn &&
          <>
          <Player visable={show} />
          <Playlists />
          </>}
        </div>

      </section>
    </div>
  )
}





export default App;
