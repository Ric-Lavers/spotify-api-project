import React from 'react'
import { useHistory } from 'react-router-dom'

import SpotifyLogin from 'components/SpotifyLogin'
import variables from 'styles/variables'
import { GlobalContext } from '../../globalContext'
import PartyBlendsLogo from '../../images/party-blends.png'
import SpotifyTxtLogo from '../../images/Spotify_Logo_Green.png'
import LinkedInLogo from '../../images/LinkedIn.png'
import { ReactComponent as GithubLogo } from '../../images/github-logo.svg'
import Back from './Back'

const { colors } = variables

const Layout = ({ children, enableBack = false }) => {
  const history = useHistory()
  //@ts-ignore
  const [state, dispatch] = React.useContext(GlobalContext)

  const handleSetLogin = (payload) => {
    dispatch({
      type: 'user/loginSpotify',
      payload,
    })
  }

  return (
    <div className="party-blends">
      <header className={`party-blends-header ${enableBack ? '' : 'home'}`}>
        {enableBack && (
          <label className="back-button-container">
            <Back
              onClick={() => {
                history.push('/')
              }}
              title="make another party blend"
            />
          </label>
        )}
        <SpotifyLogin
          onLogIn={handleSetLogin}
          logo={
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
          }
        />
        {enableBack && <div className="hide-up-sm desktop-spacer" />}
      </header>
      <main className="App-header">
        {state.isSpotifyLoggedIn ? (
          <>{children}</>
        ) : sessionStorage.getItem('spotifyToken') ? (
          <></>
        ) : (
          <>
            <p style={{ padding: '0 16px' }}>
              Welcome to Party Blends - a way to blend all your friends
              favourite tracks into one Spotify playlist.
            </p>
            <p style={{ padding: '0 16px' }}>
              ... so to make this work you need to login into spotify and allow
              permissions :)
            </p>
          </>
        )}
      </main>
      <footer>
        <div>
          made by Ric Lavers{' '}
          <a href="https://github.com/Ric-Lavers" target="_blank">
            <GithubLogo height={24} fill="white" />
          </a>
          <a href="https://www.linkedin.com/in/ric-lavers/" target="_blank">
            <img height={24} src={LinkedInLogo} />
          </a>
        </div>
        <div>
          powered by <img height={24} src={SpotifyTxtLogo} />
        </div>
      </footer>
    </div>
  )
}
export default Layout
