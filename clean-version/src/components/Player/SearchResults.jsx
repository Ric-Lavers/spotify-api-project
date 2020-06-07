import React, { useContext, useState } from "react";
import { useKeepFetching } from "../../hooks/apiHooks";
import { useToggle } from "../../hooks";

import { SearchResultsContext } from "./Search";
import { SpotifyHelpers } from "../../helpers";
import { ReactComponent as ArrowDown } from "../../images/custom-svgs/arrow-down.svg";
import PopularityMeter from "../../images/custom-svgs/PopularityMeter";
import Pagination from "../common/Pagination";
import {
  play,
  getHref,
  getSavedState,
  getFollowingState,
  follow,
  unFollow,
  getAlbums,
  saveTracks,
  removeTracks
} from "../../api/spotify";
import { types } from "./Search";

const findType = data => {
  const [type] = types.map(t => t + "s").filter(t => data[t]);
  return type;
};

// you can only check the status of 100 artist at a time
const addFollowingStatus = async data => {
  let itemObject = {};
  let { items } = data["artists"];
  let itemsIds = items
    .filter(({ following }) => following === undefined)
    .map(({ id }) => id);

  let statusArray = await getFollowingState(itemsIds, "artist");
  itemsIds.forEach((id, i) => {
    itemObject[id] = statusArray[i];
  });

  if (!statusArray || !statusArray.length) {
    return data;
  }

  const itemsWithStatus = items.map((item, i) => ({
    following: item.following ? item.following : itemObject[item.id],
    ...item
  }));

  return { artists: { ...data["artists"], items: itemsWithStatus } };
};

const addLabelToAlbum = async data => {
  let itemObject = {};
  let { items } = data["albums"];
  let itemsIds = items
    .filter(({ label }) => label === undefined)
    .map(({ id }) => id);

  let { albums: albumArray } = await getAlbums(itemsIds, "artist");

  itemsIds.forEach((id, i) => {
    itemObject[id] = albumArray[i];
  });

  if (!albumArray || !albumArray.length) {
    return data;
  }

  const itemsWithLabels = items.map((item, i) => ({
    label: item.label ? item.label : itemObject[item.id].label,
    popularity: item.popularity
      ? item.popularity
      : itemObject[item.id].popularity,

    ...item
  }));
  return { albums: { ...data["albums"], items: itemsWithLabels } };
};
const addSavedToTrack = async data => {
  let itemObject = {};
  let { items } = data["tracks"];
  let itemsIds = items
    .filter(({ saved }) => saved === undefined)
    .map(({ id }) => id);

  let statusArray = await getSavedState(itemsIds, "track");
  itemsIds.forEach((id, i) => {
    itemObject[id] = statusArray[i];
  });

  if (!statusArray || !statusArray.length) {
    return data;
  }

  const itemsWithStatus = items.map((item, i) => ({
    saved: item.saved ? item.saved : itemObject[item.id],
    ...item
  }));

  return { tracks: { ...data["tracks"], items: itemsWithStatus } };
};

const SearchResultsContatiner = props => {
  const [{ data }, setData] = useContext(SearchResultsContext);

  const addStatus = async artistData => {
    const statusData = await addFollowingStatus(artistData);
    setData(statusData);
  };
  const addLabel = async albumData => {
    const statusData = await addLabelToAlbum(albumData);
    setData(statusData);
  };
  const addSaved = async trackData => {
    const statusData = await addSavedToTrack(trackData);
    setData(statusData);
  };

  React.useEffect(() => {
    if (data && findType(data) === "artists") {
      if (
        data["artists"].items.filter(({ following }) => following === undefined)
          .length
      ) {
        addStatus(data);
      }
    }
    if (data && findType(data) === "albums") {
      if (
        data["albums"].items.filter(({ label }) => label === undefined).length
      ) {
        addLabel(data);
      }
    }
    if (data && findType(data) === "tracks") {
      if (
        data["tracks"].items.filter(({ saved }) => saved === undefined).length
      ) {
        addSaved(data);
      }
    }
  }, [data]);

  if (!data || !Object.keys(data).length) {
    return <span id="search-results" />;
  }

  const followArtist = async (ids, checked) => {
    const success = checked
      ? await follow(ids, "artist")
      : await unFollow(ids, "artist");

    if (success) {
      const updatedItems = data["artists"].items.map(item => {
        item.following = [].concat(ids).includes(item.id)
          ? checked
          : item.following;
        return item;
      });
      setData({ artists: { ...data["artists"], items: updatedItems } });
    }
  };

  const saveTrack = async (ids, checked) => {
    const success = checked ? await saveTracks(ids) : await removeTracks(ids);

    if (success) {
      const updatedItems = data["tracks"].items.map(item => {
        item.following = [].concat(ids).includes(item.id)
          ? checked
          : item.following;
        return item;
      });
      setData({ tracks: { ...data["tracks"], items: updatedItems } });
    }
  };

  const addData = async next => {
    const moreData = await getHref(next);
    const moreType = findType(moreData); // this should be the same as type!

    const nextData = {
      [moreType]: {
        ...moreData[moreType],
        items: [...data[type].items, ...moreData[moreType].items]
      }
    };
    setData({ ...data, ...nextData });

    return moreData[type].next;
  };

  // const [showAll, stopShowing ] = useKeepFetching(addData)
  const showAll = async next => {
    // little bit of recurssion
    if (next /* && fetchingNext */) {
      let nextNext = await addData(next);
      showAll(nextNext);
    }
    // setFetching(false)
  };

  const type = findType(data);

  let { next, offset, limit, total, items, href } = data[type];

  const toggleFollowAll = checked => {
    // TODO batch these in arrays of max 50
    if (items && items.length) {
      items.map(({ id }) => followArtist(id, checked));
    }
  };

  const toggleSaveAll = checked => {
    // TODO batch these in arrays of max 50
    if (items && items.length) {
      items.map(({ id }) => saveTrack(id, checked));
    }
  };
  console.log(data);
  return (
    <SearchResults
      offset={offset}
      limit={limit}
      total={total}
      type={type}
      href={href}
      next={next}
      items={items}
      data={data}
      addData={addData}
      followArtist={followArtist}
      toggleFollowAll={toggleFollowAll}
      saveTrack={saveTrack}
      toggleSaveAll={toggleSaveAll}
      showAll={showAll}
      {...props}
    />
  );
};

export const handlePlay = (type, uri) => {
  let body = {};
  if (type === "tracks") {
    body = { uris: [uri] };
  } else if (type === "albums") {
    body = { context_uri: uri };
  } else {
    body = { context_uri: uri };
  }
  play(body);
};

const TrackTable = ({ items, saveTrack, toggleSaveAll }) => (
  <table id="search-results">
    <thead>
      <tr>
        <th>Name</th>
        <th>Artists</th>
        <th>Album</th>
        <th className="hide-up-sm">Popular</th>
        <th className="hide-up-md">Released</th>
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
      </tr>
    </thead>
    <tbody>
      {items.map(
        ({
          artists,
          album: { name: albumName, release_date },
          name,
          id,
          uri,
          popularity,
          saved,
          type
        }) => {
          return (
            <tr className="results__item" key={id}>
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
              <td style={{ textAlign: "center" }}>
                <input
                  onChange={({ target: { checked } }) => saveTrack(id, checked)}
                  id="follow-check"
                  type="checkbox"
                  checked={saved}
                  name="followingLabel"
                />
              </td>
            </tr>
          );
        }
      )}
    </tbody>
  </table>
);

const ArtistTable = ({ items, followArtist, toggleFollowAll }) => (
  <table id="search-results">
    <thead>
      <tr>
        <th>Name</th>
        <th>Popular</th>
        <th className="hide-up-md">Fans</th>
        <th>
          Follow
          <input
            onChange={({ target: { checked } }) => {
              toggleFollowAll(checked);
            }}
            id="follow-check"
            type="checkbox"
            name="followingLabel"
          />
        </th>
      </tr>
    </thead>
    <tbody>
      {items.map(
        ({ artists, name, id, uri, popularity, followers, following }) => {
          return (
            <tr className="results__item" key={id}>
              <td
                className="pointer"
                onClick={() => handlePlay("artists", uri)}
              >
                {name}
              </td>
              <td>
                <PopularityMeter
                  className="popularity-meter"
                  popularity={popularity}
                />
              </td>
              <td className="hide-up-md">{followers.total.toString()}</td>
              <td style={{ textAlign: "center" }}>
                <input
                  onChange={({ target: { checked } }) =>
                    followArtist(id, checked)
                  }
                  id="follow-check"
                  type="checkbox"
                  checked={following}
                  name="followingLabel"
                />
              </td>
            </tr>
          );
        }
      )}
    </tbody>
  </table>
);
const AlbumTable = ({ items }) => (
  <table id="search-results">
    <thead>
      <tr>
        <th>Name</th>
        <th>Artists</th>
        <th>Label</th>
        <th className="hide-up-sm">Popular</th>
        <th className="hide-up-md">Released</th>
        <th className="hide-up-md">Type</th>
      </tr>
    </thead>
    <tbody>
      {items.map(
        ({
          label,
          popularity,
          album_type,
          release_date,
          artists,
          name,
          id,
          uri
        }) => {
          return (
            <tr className="results__item" key={id}>
              <td
                className="pointer"
                onClick={() => handlePlay("artists", uri)}
              >
                {name}
              </td>
              <td>{SpotifyHelpers.combineArtists(artists)}</td>
              <td>{label}</td>
              <td className="hide-up-sm">
                <PopularityMeter
                  className="popularity-meter"
                  popularity={popularity}
                />
              </td>
              <td className="hide-up-md">
                {release_date
                  .split("-")
                  .reverse()
                  .join("-")}
              </td>
              <td className="hide-up-md">{album_type}</td>
            </tr>
          );
        }
      )}
    </tbody>
  </table>
);

const SearchResults = ({
  type,
  next,
  items,
  href,
  addData,
  followArtist,
  toggleFollowAll,
  saveTrack,
  toggleSaveAll,
  offset,
  limit,
  total,
  showAll
}) => {
  const [isShowingAll, setShowing] = useState(false);
  const searchByLabel = href.includes("label");
  const shown = offset + limit;
  const more = total - shown;
  const hasArtistsName = type === "tracks" || type === "albums"; //&& searchByLabel
  const hasPopulatity = type === "tracks" || type === "artists";

  //TODO Add different results tables for the Four types.
  if (!items.length) {
    return <p id="search-results">no results</p>;
  }

  return (
    <div className="results results-area">
      {/* <Pagination count={items.length} limit={limit} total={total} offset={offset} onPageChange={onPageChange} /> */}
      {type === "artists" && (
        <ArtistTable
          items={items}
          followArtist={followArtist}
          toggleFollowAll={toggleFollowAll}
        />
      )}
      {type === "albums" && <AlbumTable items={items} />}
      {type === "tracks" && (
        <TrackTable
          items={items}
          saveTrack={saveTrack}
          toggleSaveAll={toggleSaveAll}
          handlePlay={handlePlay}
        />
      )}

      {type !== "artists" && type !== "albums" && type !== "tracks" && (
        <table id="search-results">
          <thead>
            <tr>
              <th>Name</th>
              {hasArtistsName && <th>Artists</th>}
              {hasPopulatity && <th>Popular</th>}
            </tr>
          </thead>
          <tbody>
            {items.map(({ artists, name, id, uri, popularity, followers }) => {
              let artistsNames;
              if (hasArtistsName) {
                artistsNames = SpotifyHelpers.combineArtists(artists);
              }
              return (
                <tr
                  className="results__item"
                  key={id}
                  onClick={() => handlePlay(type, uri)}
                >
                  <td>{name}</td>
                  {artistsNames && <td>{artistsNames}</td>}
                  {hasPopulatity && (
                    <td>
                      <PopularityMeter
                        className="popularity-meter"
                        popularity={popularity}
                      />
                    </td>
                  )}
                  {type === "artists" && <td>{followers.total.toString()}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div className="next-icon__contatiner">
        {shown < total && (
          <>
            <p>
              {" "}
              {total} {type}{" "}
            </p>
            {next && (
              <ArrowDown
                onClick={() => addData(next)}
                className="arrow-icon next-icon"
              />
            )}
            <p
              onClick={() => {
                showAll(next);
              }}
            >
              {" "}
              {more} more{" "}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResultsContatiner;
