import React from "react";

import { SpotifyHelpers, handlePlay } from "helpers";
import PopularityMeter from "images/custom-svgs/PopularityMeter";

export const TrackTable = ({ items, saveTrack, toggleSaveAll, iterate }) => (
  <table id="search-results">
    <thead>
      <tr>
        {iterate && <th></th>}
        <th>Name</th>
        <th>Artists</th>
        <th>Album</th>
        <th className="hide-up-sm">Popular</th>
        <th className="hide-up-md">Released</th>
        {toggleSaveAll && (
          <th style={{ textAlign: "center" }}>
            Like
            <input
              onChange={({ target: { checked } }) => {
                toggleSaveAll(checked);
              }}
              id="follow-check"
              type="checkbox"
              name="followingLabel"
            />
          </th>
        )}
      </tr>
    </thead>
    <tbody>
      {items.map(
        (
          {
            artists,
            album: { name: albumName, release_date },
            name,
            id,
            uri,
            popularity,
            saved,
            type
          },
          i
        ) => {
          return (
            <tr className="results__item" key={id}>
              {iterate && <td>{(i + 1).toString()}</td>}
              <td className="pointer" onClick={() => handlePlay("tracks", uri)}>
                {name}
              </td>
              <td>{SpotifyHelpers.combineArtists(artists)}</td>
              <td>{albumName}</td>
              <td className="hide-up-sm">
                <PopularityMeter
                  className="popularity-meter"
                  popularity={popularity}
                />
              </td>
              <td className="hide-up-md">{release_date}</td>
              {saveTrack && (
                <td style={{ textAlign: "center" }}>
                  <input
                    onChange={({ target: { checked } }) =>
                      saveTrack(id, checked)
                    }
                    id="follow-check"
                    type="checkbox"
                    checked={saved}
                    name="followingLabel"
                  />
                </td>
              )}
            </tr>
          );
        }
      )}
    </tbody>
  </table>
);
