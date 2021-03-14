import React from "react";
import truncate from "lodash.truncate";

export const UserPlaylistsSelect = ({
  label,
  playlists,
  currentPlaylistId,
  onChange,
  loadingStatus = ""
}) => {
  return (
    <label className="user-playlists">
      <span>{label}</span>
      <div>
        <select
          onChange={({ target: { value: playlistId } }) => onChange(playlistId)}
          className="playlists-select"
          value={currentPlaylistId}
        >
          <option></option>
          {playlists.map(pl => (
            <option value={pl.id}>{truncate(pl.name)}</option>
          ))}
        </select>
        <span>{loadingStatus}</span>
      </div>
    </label>
  );
};

export default UserPlaylistsSelect;
