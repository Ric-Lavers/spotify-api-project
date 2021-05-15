import React, { createContext, useReducer } from 'react'

import { getMe, getDevices } from './api/spotify'

/* an object dictating the state of the app such as whats open, minimized, etc*/
const initalState = {
  isSpotifyLoggedIn: false,
  userData: {},
  devices: [],
  playListIsHidden: false, //TODO refactor to visible object
  visible: {
    playlist: false,
    topTable: false,
    devices: false,
    stats: false,
  },
  searchQuery: {
    type: '',
    searchText: '',
    searchLabel: false,
  },
  currentPlaying: {
    image: {
      src: '',
      alt: '',
    },
    details: {},
  },
  skipList: {
    tracks: new Set(
      JSON.parse(localStorage.getItem('skipList.tracks') || '[]')
    ),
    artists: new Set(
      JSON.parse(localStorage.getItem('skipList.artists') || '[]')
    ),
    genres: new Set(
      JSON.parse(localStorage.getItem('skipList.genres') || '[]')
    ),
  },
}

export const GlobalContext = createContext(initalState)

function reducer(state, action) {
  switch (action.type) {
    case 'user/loginSpotify':
      return {
        ...state,
        isSpotifyLoggedIn: action.payload,
      }
    case 'user/me':
      return {
        ...state,
        userData: action.payload,
      }
    case 'user/devices':
      return {
        ...state,
        devices: action.payload,
      }
    case 'playlist/hide':
      return {
        ...state,
        playListIsHidden: !state.playListIsHidden,
      }
    case 'visible/toggle-devices':
      return {
        ...state,
        visible: {
          ...state.visible,
          devices: !state.visible.devices,
        },
      }
    case 'visible/toggle-playlist':
      return {
        ...state,
        visible: {
          ...state.visible,
          playlist: !state.visible.playlist,
        },
      }
    case 'visible/toggle-top-table':
      return {
        ...state,
        visible: {
          ...state.visible,
          topTable: !state.visible.topTable,
        },
      }
    case 'visible/toggle-stats':
      return {
        ...state,
        visible: {
          ...state.visible,
          stats: !state.visible.stats,
        },
      }
    case 'search/set':
      return {
        ...state,
        searchQuery: {
          ...state.searchQuery,
          ...action.payload,
        },
      }
    case 'currentPlaying/image':
      return {
        ...state,
        currentPlaying: {
          ...state.currentPlaying,
          image: action.payload,
        },
      }
    case 'currentPlaying/details':
      return {
        ...state,
        currentPlaying: {
          ...state.currentPlaying,
          details: action.payload,
        },
      }

    case 'skipList/add':
      let { skipType, id } = action
      return {
        ...state,
        skipList: {
          ...state.skipList,
          [skipType]: state.skipList[skipType].add(id),
        },
      }

    case 'skipList/remove':
      ;({ skipType, id } = action)
      return {
        ...state,
        skipList: {
          ...state.skipList,
          [skipType]: state.skipList[skipType].delete(id),
        },
      }

    default:
      break
  }
}

export const GlobalUiState = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initalState)

  React.useEffect(() => {
    fetchMe()
    fetchDevices()
  }, [])

  const fetchMe = async () => {
    const payload = await getMe()
    payload &&
      dispatch({
        payload,
        type: 'user/me',
      })
  }
  const fetchDevices = async () => {
    const { devices: payload } = await getDevices()
    payload &&
      dispatch({
        payload,
        type: 'user/devices',
      })
  }

  return (
    <GlobalContext.Provider
      value={[
        state,
        dispatch,
        {
          fetchDevices,
        },
      ]}
    >
      {' '}
      {children}{' '}
    </GlobalContext.Provider>
  )
}
