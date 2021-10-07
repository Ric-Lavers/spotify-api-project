import React from 'react'
import { useHistory } from 'react-router-dom'

import SpotifyLogin from 'components/SpotifyLogin'
import variables from 'styles/variables'
import { GlobalContext } from '../../globalContext'
import PartyBlendsLogo from '../../images/party-blends.png'
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
          <Back
            onClick={() => {
              history.push('/')
            }}
            title="make another party blend"
          />
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
            <p>
              hey, so to make this work you need to login into spotify and allow
              permissions :)
            </p>
          </>
        )}
      </main>
    </div>
  )
}
export default Layout
