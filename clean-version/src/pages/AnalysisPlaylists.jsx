import React, { memo, useContext, useState, useEffect } from "react";
import Slide from "react-reveal/Slide";
import makeCarousel from "react-reveal/makeCarousel";

import truncate from "lodash.truncate";
import get from "lodash.get";

import { useParams } from "react-router-dom";
import { useToggle, withCurrentSong } from "hooks";

import {
  getAllPlaylistsTracks,
  getMePlaylists,
  getHeapsAudioFeatures,
  play,
  createUserPlaylistWithTracks
} from "api/spotify";
import { stats as _stats } from "../components/stats/Stats";
import { useAudioControls } from "../components/AudioControls";
import { GlobalContext } from "globalContext";
import PopularityMeter from "images/custom-svgs/PopularityMeter";

const tableKeys = [..._stats];

const useSongsWithAudioFeatures = playlistId => {
  const [songWithFeatures, setSongWithFeatures] = useState([]);
  const [currentSort, setCurrentSort] = useState("");

  const getSongsWithAudioFeatures = async () => {
    const { items } = await getAllPlaylistsTracks(playlistId);

    const songIds = items.map(({ track }) => track.id);
    const audioFeatures = await getHeapsAudioFeatures(songIds);

    const songs = items.map(({ track }, i) => ({
      ...track,
      audioFeatures: audioFeatures[i],
      include: true
    }));
    setSongWithFeatures(songs);
  };

  useEffect(() => getSongsWithAudioFeatures(), []);

  const sortTracks = (key, direction = "ASC") => {
    setCurrentSort(`${key} - ${direction}`);
    if (songWithFeatures[0].audioFeatures.hasOwnProperty(key)) {
      const sorted = songWithFeatures.sort((a, b) =>
        direction === "ASC"
          ? a.audioFeatures[key] - b.audioFeatures[key]
          : b.audioFeatures[key] - a.audioFeatures[key]
      );
      setSongWithFeatures([...sorted]);
    }
    if (songWithFeatures[0].hasOwnProperty(key)) {
      if (typeof songWithFeatures[0][key] === "string") {
        const sorted =
          direction === "ASC"
            ? songWithFeatures.sort()
            : songWithFeatures.sort().reverse();
        setSongWithFeatures([...sorted]);
      }
      const sorted = songWithFeatures.sort((a, b) =>
        direction === "ASC" ? a[key] - b[key] : b[key] - a[key]
      );
      setSongWithFeatures([...sorted]);
    }
  };
  const uris = songWithFeatures.map(({ uri }) => uri);
  const includedUris = songWithFeatures
    .filter(({ include }) => include)
    .map(({ uri }) => uri);

  const checkIncludeAll = bool => {
    setSongWithFeatures(prev =>
      prev.map(track => ({ ...track, include: bool }))
    );
  };
  const checkById = (id, bool) => {
    setSongWithFeatures(prev => {
      prev.find(({ id: trackId }) => trackId === id).include = bool;

      return [...prev];
    });
  };

  return [
    songWithFeatures,
    { sortTracks, uris, includedUris, currentSort, checkIncludeAll, checkById }
  ];
};

const useStatKeys = (whiteStatsList = []) => {
  const [whiteList, setWhiteList] = useState(new Set(whiteStatsList));

  const BlackStatList = ({ hide }) => {
    const handleCheck = ({ target: { checked, id } }) => {
      checked ? whiteList.add(id) : whiteList.delete(id);
      setWhiteList(new Set(whiteList));
      localStorage.setItem("preferedStatKeys", JSON.stringify([...whiteList]));
    };
    return (
      <form
        style={hide ? { display: "none" } : {}}
        onChange={handleCheck}
        className="stat-check-list"
      >
        {tableKeys.map(stat => (
          <div className="stat-checkbox">
            <label htmlFor={stat}>{stat}</label>
            <input id={stat} type="checkbox" checked={whiteList.has(stat)} />
          </div>
        ))}
        <div className="stat-checkbox" />
      </form>
    );
  };
  return [[...whiteList], BlackStatList];
};

const useMePlaylists = () => {
  const [playlists, setPlaylists] = useState([]);

  const getPlaylists = async () => {
    const { items } = await getMePlaylists();
    // console.log(items);
    setPlaylists(items);
  };

  useEffect(getPlaylists, []);

  return [playlists, getPlaylists];
};

const UserPlaylistsSelect = ({ playlists, currentPlaylistId, onChange }) => {
  return (
    <label className="user-playlists">
      <span>select another playlist</span>
      <select
        onChange={onChange}
        className="playlists-select"
        value={currentPlaylistId}
      >
        <option></option>
        {playlists.map(pl => (
          <option value={pl.id}>{truncate(pl.name)}</option>
        ))}
      </select>
    </label>
  );
};

const AnalysisPlaylistsPage = React.memo(({ currentSong }) => {
  const [
    {
      userData: { id: userId }
    }
  ] = useContext(GlobalContext);
  const { playlistId } = useParams();
  const [playlists, getPlaylists] = useMePlaylists();
  const currentPlaylist = playlists.find(({ id }) => id === playlistId);

  const [
    tracks,
    { sortTracks, uris, includedUris, currentSort, checkIncludeAll, checkById }
  ] = useSongsWithAudioFeatures(playlistId);

  const preferedStatKeys = JSON.parse(
    localStorage.getItem("preferedStatKeys")
  ) || ["popularity", "danceability", "tempo"];
  const [stats, BlackStatList] = useStatKeys(preferedStatKeys);
  const handleSort = ({ target: { value } }) => {
    if (!value) return;
    const [v, d] = value.split("-");
    sortTracks(v, d);
  };
  // console.log(tracks[0]);
  // console.log(playlists);
  const currentTrackId = get(currentSong, "item.id");

  const [isHidden, toggleHidden] = useToggle(true);

  const handleChangePlaylist = ({ target: { value: playlistId } }) => {
    playlistId && window.location.replace(`/analysis/${playlistId}`);
  };

  const handleCreatePlaylist = async ({
    name,
    description,
    isPublic,
    collaborative
  }) => {
    if (!includedUris.length) return;
    const playlist = await createUserPlaylistWithTracks(
      userId,
      {
        name,
        description,
        isPublic,
        collaborative
      },
      includedUris
    );
    await getPlaylists();
    return playlist;
  };

  return (
    <>
      <div className="analysis-playlists">
        <UserPlaylistsSelect
          onChange={handleChangePlaylist}
          playlists={playlists}
          currentPlaylistId={playlistId}
        />
        {currentPlaylist && (
          <div className="playlist-info">
            <h4>{currentPlaylist.name}</h4>
            {/* <p>{currentPlaylist.description}</p> */}
            <img src={get(currentPlaylist, "images[0].url")} alt="" srcset="" />
          </div>
        )}
      </div>
      <div className="analysis-playlists">
        {currentPlaylist && (
          <SavePlaylist
            user_id={userId}
            currentPlaylist={currentPlaylist}
            currentSort={currentSort}
            createPlaylist={handleCreatePlaylist}
          />
        )}
      </div>
      <div className="analysis-playlists">
        <BlackStatList hide={isHidden} />

        <div>
          <button onClick={toggleHidden}>
            table settings (audio features)
          </button>

          <select onChange={handleSort}>
            <option>unsorted</option>
            {tableKeys.map(key => (
              <>
                <option value={`${key}-ASC`}>{key} - ASC</option>
                <option value={`${key}-DESC`}>{key} - DESC</option>
              </>
            ))}
          </select>
        </div>
      </div>

      <PlaylistTable
        tracks={tracks}
        currentTrackId={currentTrackId}
        uris={uris}
        stats={stats}
        onAllCheck={checkIncludeAll}
        onCheckTrack={checkById}
      />
    </>
  );
});

const PlaylistTable = memo(
  ({ tracks, currentTrackId, uris, stats, onAllCheck, onCheckTrack }) =>
    !tracks.length ? null : (
      <table>
        <thead>
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
                audioFeatures,
                popularity,
                uri,
                include
              },
              i
            ) => {
              const rows = {
                albumName,
                popularity,
                ...audioFeatures
              };

              return (
                <tr>
                  <td style={{ textAlign: "center" }}>
                    <input
                      onChange={({ target: { checked } }) =>
                        onCheckTrack(id, checked)
                      }
                      type="checkbox"
                      name="include"
                      checked={include}
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

                    return <td>{rows[statKey]}</td>;
                  })}
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    )
);

const SavePlaylist = ({
  user_id,
  currentSort,
  currentPlaylist,
  createPlaylist
}) => {
  const [{ name, description, isPublic, collaborative }, setValues] = useState({
    name: currentPlaylist.name || "",
    description: "",
    isPublic: false,
    collaborative: false
  });
  useEffect(() => {
    if (currentPlaylist.name)
      setValues(prev => ({
        ...prev,
        name: `${currentPlaylist.name || name}${
          currentSort ? ` (${currentSort})` : ""
        }`
      }));
  }, [currentPlaylist.name, currentSort]);

  const handleChange = ({ target: { name, value, checked } }) => {
    setValues(prev => ({
      ...prev,
      [name]: value === "on" ? checked : value
    }));
  };
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadError, setHadError] = useState(false);

  const handleSubmitPlaylist = async e => {
    e.preventDefault();
    const playlist = await createPlaylist({
      name,
      description,
      isPublic,
      collaborative
    });

    if (playlist) {
      setHadSuccess(true);
      setTimeout(() => {
        setHadSuccess(false);
      }, 3000);
    } else {
      setHadError(true);
      setTimeout(() => {
        setHadError(false);
      }, 3000);
    }
  };

  return (
    <form
      onSubmit={handleSubmitPlaylist}
      onChange={handleChange}
      className="add-playlist"
    >
      <fieldset>
        <legend>Create new playlist</legend>
        <label>
          <span>Name</span>
          <input type="text" name="name" value={name} />
        </label>
        <label>
          <span>Description</span>
          <input type="text" name="description" value={description} />
        </label>
        <label>
          <span>Public</span>
          <input name="isPublic" type="checkbox" checked={isPublic} />
        </label>
        <label>
          <span>Collaborative</span>
          <input name="collaborative" type="checkbox" checked={collaborative} />
        </label>
        <input type="submit" value="create new playlist" />
        {hadSuccess && "👍"}
        {hadError && "👎"}
      </fieldset>
    </form>
  );
};

export default withCurrentSong(AnalysisPlaylistsPage);