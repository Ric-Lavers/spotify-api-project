import React, { createContext, useReducer } from 'react'

import { getMe , currentPlaying} from './api/spotify';

/* an object dictating the state of the app such as whats open, minimized, etc*/
const initalState = {
  isSpotifyLoggedIn: false,
  userData: {},
  playListIsHidden: false,
  searchQuery: {
    type: '',
    searchText: "",
    searchLabel: false,
  },
  currentPlaying: {
    image:{
      src: "",
      alt: ""
    }
  }
}

export const GlobalContext = createContext(initalState)

function reducer(state, action) {
  switch (action.type) {
    case 'user/loginSpotify':
      return({ ...state, isSpotifyLoggedIn: action.payload })
    case 'user/me': 
      return ({...state, userData: action.payload})
    case 'playlist/hide':
      return {...state, playListIsHidden: !state.playListIsHidden }
    case 'search/set':
      return {...state, searchQuery: {...state.searchQuery, ...action.payload} }
    case 'currentPlaying/image':
      return {...state, currentPlaying: {
        image: action.payload
      }}
    default:
      break;
  }
}



export const GlobalUiState = ({children}) => {
  const [ state, dispatch ] = useReducer(reducer, initalState)

  React.useEffect(() => {
    fetchMe()
  }, [])
  const fetchMe = async() => {
    const payload = await getMe()
    payload && dispatch({
      payload, 
      type: 'user/me'
    })
  }

  return (
    <GlobalContext.Provider value={[ state, dispatch ]} >
      {children}
    </GlobalContext.Provider>
  )
}