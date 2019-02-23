import React, { createContext, useReducer } from 'react'

/* an object dictating the state of the app such as whats open, minimized, etc*/
const initalState = {
  playListIsHidden: false,
  searchQuery: {
    type: '',
    searchText: "",
    searchLabel: false,
  }
}

export const GlobalContext = createContext(initalState)

function reducer(state, action) {
  switch (action.type) {
    case 'playlist/hide':
      return {...state, playListIsHidden: !state.playListIsHidden }
    case 'search/set':
      return {...state, searchQuery: {...state.searchQuery, ...action.payload} }
    default:
      break;
  }
}

export const GlobalUiState = ({children}) => {
  const [ state, dispatch ] = useReducer(reducer, initalState)

  return (
    <GlobalContext.Provider value={[ state, dispatch ]} >
      {children}
    </GlobalContext.Provider>
  )
}