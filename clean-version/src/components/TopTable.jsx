import React, { useState, useContext } from "react";
import { get } from "lodash";
import Slide from "react-reveal/Slide";
import Fade from "react-reveal/Fade";

import { GlobalContext } from "globalContext";
import { TrackTable } from "./Player/TrackTable";
import ArtistTable from "./Player/ArtistTable";
import topTacksData from "__tests__/mocks/topTracks.json";
import topArtistsData from "__tests__/mocks/topArtists.json";
import { top_time_range } from "constants/index";
import { getTopTracks, getTopArtists } from "api/spotify";

const buttonGroup = {
  display: "flex",
  justifyContent: "flex-start",
  width: 100
};
const button = {
  cursor: "pointer",
  padding: 4
};
const TopRow = {
  display: "flex",
  justifyContent: "space-between"
};

const useTopData = (type, range) => {
  const [rawData, setData] = useState({});

  const [genres, setGenres] = useState([]);
  const [, setItems] = useState([]);
  const key = `${type}_${range}`;

  const getData = async () => {
    try {
      const data =
        type === "tracks"
          ? await getTopTracks({ time_range: range })
          : await getTopArtists({ time_range: range });

      if (type === "artists") {
        const g = data.items
          .reduce((a, { genres }) => {
            genres.forEach(genre => {
              const index = a.findIndex(({ name }) => name === genre);

              if (index === -1) {
                a.push({ name: genre, count: 1 });
              } else {
                a[index].count++;
              }
            });
            return a;
          }, [])
          .sort((a, b) => b.count - a.count);

        setGenres(g);
      }

      setData({ ...rawData, [key]: data });
      setItems(data.items);
    } catch (error) {
      console.error(`fetching top ${type} failed`);
    }
  };

  React.useEffect(() => {
    if (!rawData[key]) {
      getData();
    } else {
      setItems(rawData[key].items);
    }
  }, [type, range]);

  return {
    items: get(rawData, `${key}.items`, []),
    genres
  };
};

const TopTable = () => {
  const [rangeValue, setTimeRange] = useState(top_time_range[0].value);
  const [
    {
      visible: { topTable: isHidden }
    },
    dispatch
  ] = useContext(GlobalContext);
  const [isTrack, setTrack] = useState(true);
  let { genres, items } = useTopData(
    isTrack ? "tracks" : "artists",
    rangeValue
  );
  const topThreeGenres = genres.slice(0, 3);

  const ToggleButtons = () => (
    <div style={buttonGroup}>
      <button
        style={button}
        className={isTrack ? "success" : ""}
        onClick={() => setTrack(true)}>
        Tracks
      </button>
      <button
        style={button}
        className={!isTrack ? "success" : ""}
        onClick={() => setTrack(false)}>
        Artists
      </button>
    </div>
  );

  const SwitchTimeRangeButtons = () => (
    <div style={buttonGroup}>
      {top_time_range.map(({ value, label }) => (
        <button
          style={button}
          onClick={() => setTimeRange(value)}
          className={value === rangeValue ? "success" : ""}>
          {label}
        </button>
      ))}
    </div>
  );

  console.log({ isHidden });

  return (
    <Fade big when={true || isHidden}>
      <Slide duration={1000} left when={true || isHidden}>
        <div
          style={(isHidden && {}) || { display: "none" }}
          className="results top-table">
          <p className={`header pointer`}>
            <span
              onClick={() => {
                dispatch({ type: "visible/toggle-top-table" });
              }}>
              {(isHidden && "hide ") || "show "}TOP TABLE
            </span>
          </p>
          <div style={TopRow}>
            <div>
              <ToggleButtons />
              <SwitchTimeRangeButtons />
            </div>
            {!topThreeGenres.length ? null : (
              <div>
                Top Three Genres:
                <ol>
                  {topThreeGenres.map(({ name }) => (
                    <li>{name}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
          {isTrack ? (
            <TrackTable id="top-table" items={items} iterate />
          ) : (
            <ArtistTable id="top-table" items={items} iterate />
          )}
        </div>
      </Slide>
    </Fade>
  );
};

export default TopTable;
