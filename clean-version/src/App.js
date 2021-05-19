import React, { useState } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import get from 'lodash.get'
import { GlobalUiState, GlobalContext } from './globalContext'
import Search, { SearchResultsContext } from './components/Player/Search'
import CurrentlyPlaying from './context'

import logo from './logo.svg'
import hooks from './images/hooks.svg'
import './styles/_index.scss'
import DiscogsCallbackPage from './pages/DiscogsCallbackPage'
import SpotifyLogin from './components/SpotifyLogin'
// import DiscogsLogin from './components/DiscogsLogin'
import Player from './components/Player/Player'
import SearchResults from './components/Player/SearchResults'
import Playlists from './components/playlists/Playlists'
import Devices from './components/settings/Devices'
import Stats from './components/stats/Stats'
import TopTable from './components/TopTable'
import SkipList from './components/skip-list/SkipList'
import ErrorBoundary from './components/common/ErrorBoundary'
import AnalysisPlaylistsPage from './pages/AnalysisPlaylists'

import { useToggle } from './hooks'
import { ReactComponent as GithubLogo } from './images/github-logo.svg'

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <GlobalUiState>
          <Layout>
            <Route exact path="/" render={() => <MainPage />} />
            <Route exact path="/analysis" component={AnalysisPlaylistsPage} />
            <Route
              path="/analysis/:playlistId"
              component={AnalysisPlaylistsPage}
            />
            <Route path="/discogs-callback" component={DiscogsCallbackPage} />
            <Route path="*" render={() => <div />} />
          </Layout>
        </GlobalUiState>
      </Router>
    </ErrorBoundary>
  )
}

const Layout = ({ children }) => {
  const [showToken, toggleToken] = useToggle(false)
  const [state, dispatch] = React.useContext(GlobalContext)

  const handleSetLogin = (payload) => {
    dispatch({
      type: 'user/loginSpotify',
      payload,
    })
  }

  return (
    <div className="App">
      {process.env.NODE_ENV === 'development' && (
        <header>
          {showToken ? (
            <small>{sessionStorage.spotifyToken}</small>
          ) : (
            <small style={{ cursor: 'pointer' }} onClick={toggleToken}>
              <b>jWt</b>
            </small>
          )}
          <a
            target="_blank"
            href="https://github.com/Ric-Lavers/spotify-api-project"
          >
            <GithubLogo />
          </a>
        </header>
      )}
      <section
        className="App-header"
        style={{
          backgroundImage: `url(${get(state, 'currentPlaying.image.src')})`,
          backgroundPosition: 'top',
        }}
      >
        <SpotifyLogin onLogIn={handleSetLogin} />
        {state.isSpotifyLoggedIn ? (
          <>{children}</>
        ) : sessionStorage.getItem('spotifyToken') ? (
          <></>
        ) : (
          <>
            <p>this site does not have a db, so can't record your data.</p>
            <p>
              please login and allow all the spotify permissions...
              <br />
              yehhh all of them, but you know no data base.
            </p>
          </>
        )}
      </section>
    </div>
  )
}

const MainPage = () => {
  const [show, toggleShow] = useToggle(true)
  const [state, dispatch] = React.useContext(GlobalContext)
  const [data, setState] = useState(null)

  if (!show) return null
  return (
    <CurrentlyPlaying>
      {/*   <DiscogsLogin />
   
      <img src={logo} className="App-logo" alt="logo" onClick={toggleShow} />

       <SpotifyLogo
        style={{ opacity: "1", fill: "#1DB954" }}
        className={"App-logo hooks"}
      />
     */}
      <br />
      <a style={{ color: 'white' }} href="/analysis">
        Analysis your playlists{' '}
      </a>

      {state.isSpotifyLoggedIn && (
        <>
          <TopTable />
          <div className="app-grid">
            <div className="device-area">
              <Devices />
            </div>
            <SearchResultsContext.Provider value={[data, setState]}>
              <div className="player-area">
                <SkipList />
                <Player visible={show} />
              </div>
              <div className="results-area">
                <SearchResults />
              </div>
            </SearchResultsContext.Provider>
            <div className="playlists-area">
              <Playlists />
            </div>
            <div className="stats-area">
              <Stats />
            </div>
          </div>
        </>
      )}
    </CurrentlyPlaying>
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

export default App
