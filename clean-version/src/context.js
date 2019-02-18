import React, { createContext, useState, useEffect} from 'react';
import { currentPlaying } from './api/spotify'

export const CurrentPlayingContext = createContext(false) 


const CurrentlyPlaying = ({ children }) => {
  const [ song, setSong ] = useState(false)

  useEffect(() => {
    const setCurrentPlaying = async () => {
      let playingNow = await currentPlaying()
      setSong(playingNow)
    }

    let polling = setInterval( setCurrentPlaying, 3000 )
    return () => clearInterval(polling)
  }, [])

  return (
    <CurrentPlayingContext.Provider value={song} >
      <>
        { children }
      </>
    </CurrentPlayingContext.Provider>
  )
}

export default CurrentlyPlaying


class CurrentlyPlayingClass extends React.Component {

  state = {
    song: null
  }

  componentDidMount() {
    setInterval( this.setCurrentPlaying, 3000 )
  }
  componentDidUpdate(prevProps) {
  }
  
  componentWillUnmount() {
    clearInterval(this.setCurrentPlaying)
  }

  setCurrentPlaying = async () => {
    let playingNow = await currentPlaying()
    this.setState({ song: playingNow })
  }
  

  render(){
    const { children } = this.props;
    const { song } = this.state;

    return (
      <CurrentPlayingContext.Provider value={song} >
      <>
        { children  }
      </>
    </CurrentPlayingContext.Provider>
    )
  }
}
