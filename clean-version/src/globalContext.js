import React, { createContext, useReducer } from 'react'

import { getMe , getDevices} from './api/spotify';

/* an object dictating the state of the app such as whats open, minimized, etc*/
const initalState = {
  isSpotifyLoggedIn: false,
  userData: {},
  devices: [],
  playListIsHidden: false, //TODO refactor to visible object
  visible: {
    playlist: false,
    devices: false,
  },
  searchQuery: {
    type: '',
    searchText: "",
    searchLabel: false,
  },
  currentPlaying: {
    image:{
      src: "",
      alt: ""
    },
    details: {} 
  }
}

export const GlobalContext = createContext(initalState)

function reducer(state, action) {
  switch (action.type) {
    case 'user/loginSpotify':
      return({ ...state, isSpotifyLoggedIn: action.payload })
    case 'user/me': 
      return ({...state, userData: action.payload})
    case 'user/devices': 
      return ({...state, devices: action.payload})
    case 'playlist/hide':
      return {...state, playListIsHidden: !state.playListIsHidden }
    case 'visible/toggle-devices':
      return {...state, visible: {...state.visible, devices: !state.visible.devices } }
    case 'visible/toggle-playlist':
      return {...state, visible: {...state.visible, playlist: !state.visible.playlist } }
    case 'search/set':
      return {...state, searchQuery: {...state.searchQuery, ...action.payload} }
    case 'currentPlaying/image':
      return {...state, currentPlaying: {
        ...state.currentPlaying,
        image: action.payload
      }}
    case 'currentPlaying/details':
      return {...state, currentPlaying: {
        ...state.currentPlaying,
        details: action.payload
      }}
    default:
      break;
  }
}



export const GlobalUiState = ({children}) => {
  const [ state, dispatch ] = useReducer(reducer, initalState)

  React.useEffect(() => {
    fetchMe()
    fetchDevices()
  }, [])

  const fetchMe = async() => {
    const payload = await getMe()
    payload && dispatch({
      payload, 
      type: 'user/me'
    })
  }
  const fetchDevices = async() => {
    const {devices: payload} = await getDevices()
    payload && dispatch({
      payload, 
      type: 'user/devices'
    })
  }

  return (
    <GlobalContext.Provider value={[ state, dispatch, { fetchDevices } ]} >
      {children}
    </GlobalContext.Provider>
  )
}