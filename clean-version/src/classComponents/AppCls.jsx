import React, { Component } from 'react'

import { currentPlaying } from './api/spotify.js'
import logo from './logo.svg';
import hooks from './images/hooks.svg'
import './styles/index.scss';
import SpotifyLogin from './components/SpotifyLogin';
import Player from './components/Player/Player';

import { CurrentPlayingContext } from './context' 

class AppCls extends Component {//56 line component

	state = {
		show: false,
		song: false,
		isFetching: false,
	}

	componentDidMount() {
		setInterval( setCurrentPlaying, 3000 )
	}

	componentWillUnmount() {
		clearInterval(polling)
	}

	setCurrentPlaying = async () => {
		const { isFetching } = this.state;

		if ( isFetching ) return
		this.setState({ 
			isFetching: true
		})
    
    let playingNow = await currentPlaying()
    this.setState({
			song: playingNow,
			isFetching: false
		})
  }

	render() {
		const { song } = this.state;

		return (
			<CurrentPlayingContext.Provider value={song}>
				<div className="App">
				<header className="App-header">
					<SpotifyLogin/>

					<img src={logo} className="App-logo" alt="logo"
						onClick={() => this.setState(prevState => {
							prevState.show = !prevState.show
							return prevState
						})}
					/>
					<img src={hooks} alt="logo" className="App-logo hooks"/>

			{show &&
					<Player visable={show} />}
						
					</header>
				</div>
			</CurrentPlayingContext.Provider>
		)
	}
}

export default AppCls;
