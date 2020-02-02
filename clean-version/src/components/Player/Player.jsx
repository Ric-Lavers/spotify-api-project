import React, { useContext, useState } from "react";

import { GlobalContext } from "../../globalContext";
import CurrentlyPlaying from "../../context";
import { useFlash } from "../../hooks";
import ControlButtons from "./ControlButtons";
import Progress from "./Progress";
import Details from "./Details";
import Search, { SearchResultsContext } from "./Search";
import SearchResults from "./SearchResults";
import { Up, Down } from "../../images/custom-svgs/arrows";
import { ReactComponent as DeviceIcon } from "../../images/devices.svg";
import ActionButton from "components/common/ActionButton";

const noBorderTop = {
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0
};

const PlayerAPI = () => {
  const [state, dispatch, { fetchDevices }] = useContext(GlobalContext);

  const [touched, flashClass] = useFlash("touched");

  return (
    <div className="player" style={state.visible.devices ? noBorderTop : {}}>
      <ActionButton
        Icon={DeviceIcon}
        action={() => {
          dispatch({ type: "visible/toggle-devices" });
          fetchDevices();
        }}
        className="device-button pointer"
      />

      <p className={`header pointer ${touched}`}>
        <span
          onClick={() => {
            flashClass();
            dispatch({ type: "visible/toggle-playlist" });
          }}>
          {state.visible.playlist ? "hide " : "show "}PLAYLISTS
        </span>
      </p>

      <div className="audio-controls">
        <CurrentlyPlaying>
          <Details />
          <ControlButtons />
          <Progress />
        </CurrentlyPlaying>
      </div>
      <Search query={state.searchQuery} />
    </div>
  );
};

export default PlayerAPI;
