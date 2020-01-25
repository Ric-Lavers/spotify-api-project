import React, { useState } from 'react';
import { BrowserRouter as Router, Route} from 'react-router-dom'
import { GlobalUiState, GlobalContext } from './globalContext'
import Search, { SearchResultsContext } from './components/Player/Search'
import CurrentlyPlaying from './context'

import logo from './logo.svg';
import hooks from './images/hooks.svg'
import './styles/_index.scss';
import DiscogsCallbackPage from './pages/DiscogsCallbackPage'
import SpotifyLogin from './components/SpotifyLogin';
import DiscogsLogin from './components/DiscogsLogin';
import Player from './components/Player/Player';
import SearchResults from './components/Player/SearchResults';
import Playlists from './components/playlists/Playlists'
import Devices from './components/settings/Devices'
import Stats from './components/stats/Stats'

import { useToggle } from './hooks'
import { ReactComponent as GithubLogo } from './images/github-logo.svg'


const App = () => {

  return (
    <Router>
      <GlobalUiState>
        <Route  path="/" render={() => (
          <MainPage/>
        )}/>
        <Route path="/discogs-callback" component={DiscogsCallbackPage}/>        
      </GlobalUiState>
    </Router>
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
        <DiscogsLogin />
        <img src={logo} className="App-logo" alt="logo"
          onClick={toggleShow}/>
        <img src={hooks} alt="logo" className="App-logo hooks" onClick={toggleShow}/>
          <br/>
        <>
          {show && state.isSpotifyLoggedIn &&
        <div className="app-grid" >
          <div className='device-area' >
            <Devices/>
          </div>
          <CurrentlyPlaying>
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
            <div className='stats-area' >
              <Stats />
            </div>
          </CurrentlyPlaying>
        </div>}
        </>     

      </section>
    </div>
  )
}

/* * pre grid layout w/ Playlists & Search result provider in Players
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
    </>) */




export default App;
