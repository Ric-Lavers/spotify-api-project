import React, { useState } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { GlobalUiState, GlobalContext } from "./globalContext";
import Search, { SearchResultsContext } from "./components/Player/Search";
import CurrentlyPlaying from "./context";

import logo from "./logo.svg";
import hooks from "./images/hooks.svg";
import "./styles/_index.scss";
import DiscogsCallbackPage from "./pages/DiscogsCallbackPage";
import SpotifyLogin from "./components/SpotifyLogin";
import DiscogsLogin from "./components/DiscogsLogin";
import Player from "./components/Player/Player";
import SearchResults from "./components/Player/SearchResults";
import Playlists from "./components/playlists/Playlists";
import Devices from "./components/settings/Devices";
import Stats from "./components/stats/Stats";
import TopTable from "./components/TopTable";
import SpotifyLogo from "./images/custom-svgs/SpotifyLogo";
import AnalysisPlaylistsPage from "./pages/AnalysisPlaylists";

import { useToggle } from "./hooks";
import { ReactComponent as GithubLogo } from "./images/github-logo.svg";

const App = () => {
  return (
    <Router>
      <GlobalUiState>
        <Layout>
          <Route exact path="/" render={() => <MainPage />} />
          <Route
            path="/analysis/:playlistId"
            // render={() => <section>analysis</section>}
            component={AnalysisPlaylistsPage}
          />
          <Route path="/discogs-callback" component={DiscogsCallbackPage} />
        </Layout>
      </GlobalUiState>
    </Router>
  );
};

const Layout = ({ children }) => {
  const [showToken, toggleToken] = useToggle(false);
  const [state] = React.useContext(GlobalContext);

  return (
    <div className="App">
      {showToken ? (
        <small>{sessionStorage.spotifyToken}</small>
      ) : (
        <small style={{ cursor: "pointer" }} onClick={toggleToken}>
          <b>jWt</b>
        </small>
      )}
      <a
        target="_blank"
        href="https://github.com/Ric-Lavers/spotify-api-project"
      >
        <GithubLogo />
      </a>
      <section
        className="App-header"
        style={{
          backgroundImage: `url(${state.currentPlaying.image.src})`,
          backgroundPosition: "top"
        }}
      >
        {" "}
        {children}{" "}
      </section>
    </div>
  );
};

const MainPage = () => {
  const [show, toggleShow] = useToggle(true);
  const [state, dispatch] = React.useContext(GlobalContext);
  const [data, setState] = useState(null);

  const handleSetLogin = payload => {
    dispatch({
      type: "user/loginSpotify",
      payload
    });
  };

  return (
    <>
      <SpotifyLogin onLogIn={handleSetLogin} />
      <DiscogsLogin />

      <img src={logo} className="App-logo" alt="logo" onClick={toggleShow} />

      <SpotifyLogo
        style={{ opacity: "1", fill: "#1DB954" }}
        className={"App-logo hooks"}
      />
      {/* <img
          src={hooks}
          alt="logo"
          className="App-logo hooks"
          onClick={toggleShow}
        /> */}

      <br />
      <>
        {show &&
          state.isSpotifyLoggedIn && [
            <TopTable />,
            <div className="app-grid">
              <div className="device-area">
                <Devices />
              </div>
              <CurrentlyPlaying>
                <SearchResultsContext.Provider value={[data, setState]}>
                  <div className="player-area">
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
              </CurrentlyPlaying>
            </div>
          ]}
      </>
    </>
  );
};

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
