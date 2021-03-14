import React from "react";
import { play } from "api/spotify";
import { combineArtists } from "helpers";
import PopularityMeter from "images/custom-svgs/PopularityMeter";

export const PlaylistTable = ({
  tracks,
  currentTrackId,
  uris,
  stats,
  onAllCheck,
  onCheckTrack
}) =>
  !tracks.length ? null : (
    <>
      <table>
        <thead>
          <tr>
            <th colspan={stats.length + 2} className="table-length">
              {tracks.length}
            </th>
          </tr>
          <tr>
            <th style={{ textAlign: "center" }}>
              <input
                onChange={({ target: { checked } }) => onAllCheck(checked)}
                type="checkbox"
                name="include"
                defaultChecked={true}
              />
            </th>
            <th>title</th>

            {stats.map(statKey => (
              <th>{statKey}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tracks.map(
            (
              {
                id,
                name,
                album: { name: albumName },
                artists,
                audioFeatures,
                popularity,
                uri,
                include
              },
              i
            ) => {
              const rows = {
                artists,
                albumName,
                popularity,
                ...audioFeatures
              };
              const isLocalFile = uri.match("spotify:local");
              return (
                <tr>
                  <td style={{ textAlign: "center" }}>
                    <input
                      onChange={({ target: { checked } }) =>
                        onCheckTrack(id, checked)
                      }
                      type="checkbox"
                      name="include"
                      checked={!isLocalFile && include}
                      disabled={isLocalFile}
                    />
                  </td>
                  <td
                    className={`playlist__song ${
                      currentTrackId === id ? "green" : ""
                    }`}
                    onClick={() =>
                      play({ uris: uris, offset: { position: i } })
                    }
                  >
                    {name}
                  </td>

                  {stats.map(statKey => {
                    if (statKey === "popularity")
                      return (
                        <td>
                          <PopularityMeter popularity={rows[statKey]} />
                        </td>
                      );
                    if (statKey === "artists")
                      return <td>{combineArtists(rows[statKey])}</td>;
                    return <td>{rows[statKey]}</td>;
                  })}
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </>
  );
