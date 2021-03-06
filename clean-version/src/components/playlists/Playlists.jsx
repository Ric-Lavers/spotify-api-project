import React, { useState, useEffect, useContext } from "react";
import Slide from "react-reveal/Slide";
import Fade from "react-reveal/Fade";

import { GlobalContext } from "globalContext";
import {
  getMePlaylists,
  getPlaylistsTracks,
  play,
  getMeSavedTracks,
  getTopTracks,
  getMeSavedAlbums,
  getHref
} from "../../api/spotify";
import ActionButton from "components/common/ActionButton";

const PlaylistsItem = ({
  setSelected,
  name,
  id,
  uri,
  selectedId,
  isPublic
}) => (
  <li
    id={id}
    className="playlist__item"
    onClick={() =>
      setSelected(id === selectedId ? { id: null, uri: null } : { id, uri })
    }
  >
    {name}
    <i>{` - ${isPublic ? "public" : "private"}`}</i>
  </li>
);
export const usePlaylistSongs = (playlistId, fetchAllTracks = false) => {
  const [{ total }, setSongData] = useState({
    href: "",
    limit: 0,
    offset: 0,
    previous: null,
    total: 0
  });
  const [songs, setSongs] = useState([]);
  const [nextHref, setHref] = useState("");
  const [fetchAll, setFetchingAll] = useState(false);

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistsTracks(playlistId);
    }
  }, [playlistId]);

  const fetchPlaylistsTracks = async id => {
    if (id === "savedTracks") {
      let { items, next, ...data } = await getMeSavedTracks();
      setSongs(items);
      setSongData(data);
      setHref(next);
    } else if (id.includes("topTracks")) {
      let query = { time_range: id.split("-")[1] };
      let { items, next, ...data } = await getTopTracks(query);
      setSongs(items.map(item => ({ track: item })));
      setSongData(data);
      setHref(next);
    } else {
      let { items, next, ...data } = await getPlaylistsTracks(id);
      setSongs(items);
      setSongData(data);
      setHref(next);
    }
    // if (fetchAllTracks) setFetchingAll(true);
  };

  const addData = async theNextHref => {
    if (theNextHref) {
      const { items, next } = await getHref(theNextHref);
      setSongs([...songs, ...items]);
      setHref(next);
    } else {
      setHref(null);
    }
  };
  useEffect(() => {
    fetchAll && addData(nextHref);
  }, [nextHref, fetchAll]);

  const uris = songs.map(({ track: { uri } }) => uri);

  return {
    total,
    setFetchingAll,
    uris,
    songs,
    nextHref
  };
};

export const PlaylistSongs = ({
  playlistId,
  context_uri,
  currentlyPlayingId
}) => {
  const { total, setFetchingAll, uris, songs, nextHref } = usePlaylistSongs(
    playlistId
  );

  return (
    <React.Suspense fallback={<p>...loading</p>}>
      <>
        {songs.length && <AnalyisTracks playlistId={playlistId} />}
        {songs.map(({ track: { name, id, uri } }, i) => (
          <li
            onClick={() =>
              context_uri
                ? play({ context_uri, offset: { position: i } })
                : play({ uris: uris, offset: { position: i } })
            }
            key={id}
            id={id}
            className={`playlist__song ${
              currentlyPlayingId === id ? "green" : ""
            }`}
          >
            {name}
          </li>
        ))}
        {nextHref && (
          <a onClick={() => setFetchingAll(true)}> Show all {total} tracks</a>
        )}
      </>
    </React.Suspense>
  );
};

export const AnalyisTracks = ({ playlistId }) => {
  return (
    <>
      <button
        onClick={() => window.location.replace(`/analysis/${playlistId}`)}
      >
        Analysis tracks
      </button>
    </>
  );
};

const top_time_range = [
  { value: "long_term", label: "years" },
  { value: "medium_term", label: "6 months" },
  { value: "short_term", label: "4 weeks" }
];

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [selected, setSelected] = useState({ id: null, uri: null });
  const [
    {
      visible: { playlist: isHidden },
      currentPlaying: { details: currentPlaying }
    },
    dispatch
  ] = useContext(GlobalContext);

  const [topTrackTimeValue, setTopTrackTime] = useState(
    top_time_range[1].value
  );

  useEffect(() => {
    fetchMePlaylists();
  }, []);

  const fetchMePlaylists = async () => {
    try {
      const { items } = await getMePlaylists();
      setPlaylists(items);
    } catch (e) {}
  };

  return (
    <div className="sticky">
      <Fade big when={isHidden}>
        <Slide duration={1000} right when={isHidden}>
          <ul className="playlists" style={isHidden ? {} : { display: "none" }}>
            <p
              className="header pointer"
              onClick={() => dispatch({ type: "visible/toggle-playlist" })}
            >
              hide{" "}
            </p>
            <>
              {(selected.id === null || selected.id === "savedTracks") && (
                <PlaylistsItem
                  setSelected={setSelected}
                  selectedId={selected.id}
                  name="Your saved tracks"
                  id="savedTracks"
                  isPublic={false}
                />
              )}
              {(selected.id === null || selected.id.includes("topTracks")) && (
                <PlaylistsItem
                  enableSelect
                  setSelected={setSelected}
                  selectedId={selected.id}
                  name={
                    <>
                      Your top tracks
                      <select
                        onChange={({ target: { value } }) => {
                          console.log(value);
                          setTopTrackTime(value);
                        }}
                      >
                        {top_time_range.map(({ label, value }, i) => (
                          <option
                            selected={topTrackTimeValue === value}
                            value={value}
                          >
                            {label}
                          </option>
                        ))}
                      </select>
                    </>
                  }
                  id={`topTracks-${topTrackTimeValue}`}
                  isPublic={false}
                />
              )}
            </>

            {playlists
              .filter(({ id }) =>
                selected.id === null ? true : id === selected.id
              )
              .map(({ id, name, public: isPublic, uri }) => (
                <PlaylistsItem
                  key={id}
                  setSelected={setSelected}
                  name={name}
                  id={id}
                  uri={uri}
                  selectedId={selected.id}
                  isPublic={isPublic}
                />
              ))}
            <PlaylistSongs
              currentlyPlayingId={currentPlaying.id}
              playlistId={selected.id}
              context_uri={selected.uri}
            />
          </ul>
        </Slide>
      </Fade>
    </div>
  );
};

export default Playlists;
