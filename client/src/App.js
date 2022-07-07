import React, { useState } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import get from 'lodash.get'
import { useLocation } from 'react-router-dom'
import { SkeletonTheme } from 'react-loading-skeleton'

import { GlobalUiState, GlobalContext } from './globalContext'
import { SearchResultsContext } from './components/Player/Search'
import CurrentlyPlaying from './context'

import DiscogsCallbackPage from './pages/DiscogsCallbackPage'
import SpotifyLogin from './components/SpotifyLogin'
import Player from './components/Player/Player'
import SearchResults from './components/Player/SearchResults'
import Playlists from './components/playlists/Playlists'
import Devices from './components/settings/Devices'
import Stats from './components/stats/Stats'
import TopTable from './components/TopTable'
import SkipList from './components/skip-list/SkipList'
import ErrorBoundary from './components/common/ErrorBoundary'
import AnalysisPlaylistsPage from './pages/AnalysisPlaylists'
import PartyPlaylistPage from './pages/PartyPlaylist'
import { useToggle } from './hooks'
import { ReactComponent as GithubLogo } from './images/github-logo.svg'
import variables from './styles/variables'
import PartyBlendsLogo from './images/party-blends.png'
import './styles/_index.scss'
const { colors } = variables

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <SkeletonTheme
          color={colors.spotify.spotifyGreyMenu}
          highlightColor={colors.spotify.spotifyGreyMenu}
        >
          <GlobalUiState>
            <Route
              exact
              path={[
                '/party-playlist/:playlistId',
                '/party-playlist',
                '/party-blends/:playlistId',
                '/party-blends',
              ]}
              component={PartyPlaylistPage}
            />
            {/* <Route exact path="/scratch" render={() => <Scratch />} /> */}
            <Route
              exact
              path="/"
              render={() => (
                <Layout>
                  <MainPage />
                </Layout>
              )}
            />
            <Route
              exact
              path={['/analysis', '/analysis/:playlistId']}
              render={() => (
                <Layout>
                  <AnalysisPlaylistsPage />
                </Layout>
              )}
            />
            <Route
              exact
              path="/discogs-callback"
              render={() => (
                <Layout>
                  <DiscogsCallbackPage />
                </Layout>
              )}
            />
          </GlobalUiState>
        </SkeletonTheme>
      </Router>
    </ErrorBoundary>
  )
}

const Layout = ({ children }) => {
  const [showToken, toggleToken] = useToggle(false)
  const { pathname } = useLocation()
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
        <SpotifyLogin
          onLogIn={handleSetLogin}
          logo={
            pathname.match('party-playlist|party-blends') ? (
              <img
                style={{
                  fill: colors.success,
                  stroke: colors.success,
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  position: 'relative',
                  zIndex: 2,
                  backgroundColor: 'transparent',
                }}
                src={PartyBlendsLogo}
                alt="home"
              />
            ) : undefined
          }
        />
        {state.isSpotifyLoggedIn ? (
          <>{children}</>
        ) : sessionStorage.getItem('spotifyToken') ? (
          <></>
        ) : (
          <>
            <p>
              hey, so to make this work you need to login into spotify and allow
              all permissions :)
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
      <a
        className="user-playlists"
        style={{ color: 'white', marginBottom: 16, textDecoration: 'none' }}
        href="/analysis"
      >
        Analysis your playlists{' '}
      </a>
      <a
        className="user-playlists"
        style={{ color: 'white', textDecoration: 'none' }}
        href="/party-playlist"
      >
        Party Playlists
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
