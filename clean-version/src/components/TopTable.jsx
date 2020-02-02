import React, { useState } from "react";

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
  const [items, setItems] = useState([]);
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
    console.log({ rawData });

    if (!rawData[key]) {
      getData();
    } else {
      setItems(rawData[key]);
    }
  }, [type, range]);

  return {
    items,
    genres
  };
};

const TopTable = () => {
  const [isTrack, setTrack] = useState(true);
  const [rangeValue, setTimeRange] = useState(top_time_range[0].value);
  const { genres, items } = useTopData(
    isTrack ? "tracks" : "artists",
    rangeValue
  );
  const topThreeGenres = genres.slice(0, 3);

  const ToggleButtons = () => (
    <div style={buttonGroup}>
      <button
        style={button}
        className={isTrack ? "success" : ""}
        onClick={() => {
          setTrack(true);
        }}>
        Tracks
      </button>
      <button
        style={button}
        className={!isTrack ? "success" : ""}
        onClick={() => {
          setTrack(false);
        }}>
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

  return (
    <>
      <div style={TopRow}>
        <div>
          <ToggleButtons />
          <SwitchTimeRangeButtons />
        </div>
        {topThreeGenres.length && (
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
        <TrackTable items={items} iterate />
      ) : (
        <ArtistTable items={items} iterate />
      )}
    </>
  );
};

export default TopTable;
