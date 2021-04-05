import React, { Component } from "react";

import SpotifyLogo from "../images/custom-svgs/SpotifyLogo";
import { checkToken, refereshSpotifyLogin } from "../api/spotify";
import variables from "../styles/variables";
import { LOGIN_URL } from "../helpers";

const { colors } = variables;

export const styles = {
  container: {
    margin: variables.sizes.md
  },
  logo: {
    backgroundColor: "white",
    fill: colors.success,
    stroke: colors.success,
    width: 50,
    height: 50,
    borderRadius: 25,
    position: "relative",
    zIndex: 2
  },
  dp: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: -20,
    position: "relative"
  },
  avartarContainer: {
    display: "flex",
    position: "relative"
  },
  noLinkStyle: {
    // cursor: "pointer",
    color: "inherit",
    textDecoration: "inherit"
  }
};

const refreshToken = refresh_token => {};

class SpotifyLogin extends Component {
  state = {
    tokenPresent: null,
    tokenValid: null,

    display_name: null,
    display_picture: null,
    spotifyLink: ""
  };

  componentDidMount() {
    const { spotifyToken } = sessionStorage;

    if (spotifyToken) this.checkToken(spotifyToken);
    this.setToken();
  }

  setToken = () => {
    const address = window.location.href;
    if (address.includes("access_token=")) {
      let access_token = new URLSearchParams(window.location.search).get(
        "access_token"
      );
      let refresh_token = new URLSearchParams(window.location.search).get(
        "refresh_token"
      );
      sessionStorage.spotifyToken = access_token;
      sessionStorage.refresh_token = refresh_token;
      window.location.replace(window.origin + window.location.pathname);
    }
  };

  checkToken = async spotifyToken => {
    const { onLogIn } = this.props;

    if (spotifyToken) {
      try {
        // set User
        let { display_name, email, images, external_urls } = await checkToken(
          spotifyToken
        );
        let display_picture = images.length !== 0 ? images[0].url : null;

        this.setState({
          tokenPresent: true,
          tokenValid: true,
          display_name,
          display_picture,
          email,
          spotifyLink: external_urls.spotify
        });
        onLogIn(true);
        return true;
      } catch (error) {
        // timed out or bad token
        // window.location.href = `${LOGIN_URL}?path=${window.location.pathname}`;
        this.setState({ tokenPresent: true, tokenValid: false });
        onLogIn(false);
      }
    } else {
      // no token
      this.setState({ tokenPresent: false });
      window.location.href = LOGIN_URL;
    }
  };

  findLogoColor = (tokenPresent, tokenValid) =>
    tokenValid === null
      ? { fill: colors.inactive, stroke: colors.inactive }
      : tokenPresent && tokenValid
      ? { fill: colors.success, stroke: colors.success }
      : { fill: colors.error, stroke: colors.error };

  render() {
    const {
      tokenPresent,
      tokenValid,
      display_picture,
      display_name,
      email,
      spotifyLink
    } = this.state;
    const { isLoading } = this.props;

    const logoColor = this.findLogoColor(tokenPresent, tokenValid);

    if (isLoading) {
      return <p>...loading</p>;
    }

    return (
      <div id="spotify-login" style={styles.container}>
        <div className="pointer" onClick={() => (window.location.href = "/")}>
          <SpotifyLogo style={{ ...styles.logo, ...logoColor }} />
          {tokenValid && display_picture && (
            <>
              <img src={display_picture} alt="display" style={styles.dp} />
            </>
          )}
        </div>
        {!tokenValid && (
          <a
            style={{ color: "white" }}
            href="#"
            href={`${LOGIN_URL}?path=${window.location.pathname}`}
          >
            {sessionStorage.getItem("spotifyToken")
              ? this.state.tokenPresent
                ? "spotify auth timed out login again"
                : ""
              : `login to spotify`}
          </a>
        )}
        <div style={styles.noLinkStyle}>
          {display_name ? display_name : email}
        </div>
        <button onClick={() => refereshSpotifyLogin()}>refresh token</button>
      </div>
    );
  }
}

export default SpotifyLogin;
