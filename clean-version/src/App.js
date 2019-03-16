import React, { useState } from 'react';
import { GlobalUiState, GlobalContext } from './globalContext'
import Search, { SearchResultsContext } from './components/Player/Search'

import logo from './logo.svg';
import hooks from './images/hooks.svg'
import './styles/_index.scss';
import SpotifyLogin from './components/SpotifyLogin';
import Player from './components/Player/Player';
import SearchResults from './components/Player/SearchResults';
import Playlists from './components/playlists/Playlists'
import Devices from './components/settings/Devices'

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
  const [ data, setState ] = useState(null)

  const [grid, toggleGrid] = useToggle(true)

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
          <br/>
     {/*    <button onClick={toggleGrid} >
          {grid ? 'grid' : 'not grid'}
        </button>
        {grid ? */}
        (<>
          {show && state.isSpotifyLoggedIn &&
        <div className="app-grid" >
          <div className='device-area' >
            <Devices/>
          </div>
          <SearchResultsContext.Provider value={[data, setState]}>
            <div className='player-area' >
              <Player visible={show} />
            </div>
            <div className='results-area' >
              <SearchResults />
            </div>
          </SearchResultsContext.Provider>
          <div className='playlists-area' >
            <Playlists />
          </div>
        </div>}
        </>)

       {/*  :
        (<>
        <div>
          <Devices/>
        </div>

        <div style={{ display: 'flex' }} >
        {show && state.isSpotifyLoggedIn &&
          <>
          <Player visible={show} />
          <Playlists />
          </>}
        </div>
        </>) */}


        

      </section>
    </div>
  )
}





export default App;
