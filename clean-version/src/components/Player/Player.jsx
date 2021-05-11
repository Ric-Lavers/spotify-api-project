import React, { useContext, useState } from 'react'

import { GlobalContext } from '../../globalContext'
import CurrentlyPlaying from '../../context'
import { useFlash } from '../../hooks'
import ControlButtons from './ControlButtons'
import Progress from './Progress'
import Details from './Details'
import Search, { SearchResultsContext } from './Search'
import SearchResults from './SearchResults'
import { Up, Down } from '../../images/custom-svgs/arrows'
import { ReactComponent as DeviceIcon } from '../../images/devices.svg'
import { ReactComponent as PlaylistsIcon } from '../../images/playlists.svg'
import { ReactComponent as TopListsIcon } from '../../images/user-top-lists.svg'
import { ReactComponent as StatsIcon } from '../../images/stats.svg'
import ActionButton from 'components/common/ActionButton'

const noBorderTop = {
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
}

const PlayerAPI = () => {
  const [state, dispatch, { fetchDevices }] = useContext(GlobalContext)

  const [touched, flashClass] = useFlash('touched')

  return (
    <div className="player" style={state.visible.devices ? noBorderTop : {}}>
      <div className="action-button-group">
        <ActionButton
          Icon={DeviceIcon}
          tooltip="Show devices"
          action={() => {
            dispatch({ type: 'visible/toggle-devices' })
            fetchDevices()
          }}
          className="device-button pointer"
        />
        <ActionButton
          Icon={PlaylistsIcon}
          tooltip="Show playlists"
          action={() => {
            flashClass()
            dispatch({ type: 'visible/toggle-playlist' })
          }}
          className="device-button pointer"
        />
        <ActionButton
          Icon={TopListsIcon}
          tooltip="Show users top lists"
          action={() => {
            dispatch({ type: 'visible/toggle-top-table' })
          }}
          className={`device-button pointer ${touched}`}
        />
        <ActionButton
          Icon={StatsIcon}
          tooltip="Show stats for current song"
          action={() => {
            dispatch({ type: 'visible/toggle-stats' })
          }}
          className={`device-button pointer ${touched}`}
        />
      </div>

      {/* 
      <p className={`header pointer ${touched}`}>
        <span
          onClick={() => {
            flashClass();
            dispatch({ type: "visible/toggle-playlist" });
          }}>
          {state.visible.playlist ? "hide " : "show "}PLAYLISTS
        </span>
      </p>
 */}
      <div className="audio-controls">
        <Details />
        <ControlButtons />
        <Progress />
      </div>
      <Search query={state.searchQuery} />
    </div>
  )
}

export default PlayerAPI
