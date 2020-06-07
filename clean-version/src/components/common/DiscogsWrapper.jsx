import React from "react";
import styled from "styled-components";

import { useHandleChange } from "../../hooks/commonHooks";
import { Utils } from "../../helpers";
import { searchSpotify } from "../../api/spotify";
import { searchDiscogs } from "../../api/discogs";
import SearchIcon from "../../images/custom-svgs/SearchIcon";

import Search from "../Player/Search";

let Discogs = {
  Shell: "",
  Wrapper: ""
};
Discogs.Styles = {};

Discogs.Template = ({
  onSubmit,
  onChange,
  toggleIsLabel,
  formState = { isLabel: false, searchText: "{searchText}" },
  isFetching,
  isError,
  type,
  setType,
  types
}) => (
  <>
    <form id="search" onSubmit={onSubmit} onChange={onChange}>
      <div className="search-bar">
        <input
          defaultValue={formState.searchText}
          placeholder="Search discogs"
          autoComplete="off"
          type="text"
          className="query"
          style={{ borderBottomLeftRadius: 0 }}
          name="searchText"
          tabIndex="1"
          aria-label="search-input"
        />
        <button className="submit radius-left" type="submit" alt="submit">
          <SearchIcon isLoading={isFetching} isError={isError} />
        </button>
      </div>
      <div className="search-bar select-types">
        <select
          tabIndex="2"
          name="type"
          value={type}
          onChange={({ target }) => setType(target.value)}
        >
          {types.map(ty => (
            <option key={ty} name={ty} value={ty}>
              {ty}
            </option>
          ))}
        </select>
        <label htmlFor="label-check" tabIndex="3">
          by label
          <input
            onChange={toggleIsLabel}
            checked={formState.isLabel}
            id="label-check"
            type="checkbox"
            name="isLabel"
          />
        </label>
      </div>
    </form>
  </>
);
Discogs.Constants = {
  types: ["track", "artist", "album", "playlist"]
};

Discogs.Search = ({ query, setData }) => {
  //Constants
  let types;
  types = Discogs.Constants.types;
  //* STATE */
  const [{ isFetching, hasError }] = React.useState({
    isFetching: false,
    hasError: false
  });
  /**
   * ACTIONS
   */

  let [formState, handleFormState, setFormState] = useHandleChange({
    searchText: query,
    isLabel: false
  });

  const [type, setType] = React.useState(types[2]);

  React.useEffect(() => {
    setFormState(query);
    setType(query.type ? query.type : type);
  }, [query]);
  /**
   * EVENTS
   */
  function onSubmit(e) {
    let query, isLabel, searchText;
    ({ isLabel, searchText } = formState);
    query = (isLabel && `label:${searchText}`) || `${searchText}`;

    searchSpotify(query, type).then(data => {
      setData(data);
      Utils.scrollIntoView("search-results");
    });
  }
  const onChange = handleFormState;
  const toggleIsLabel = () =>
    setFormState(s => ({ ...s, isLabel: !s.isLabel }));

  return React.createElement(Discogs.Template, {
    onSubmit,
    onChange,
    toggleIsLabel,
    formState: { isLabel: false, searchText: "" },
    isFetching,
    isError: hasError,
    type,
    setType,
    types
  });
};

Discogs.Context = React.createContext({
  data: {}
});

Discogs.Wrapper = ({ recordLabel, searchText, isLabel, type }) => {
  console.log({ recordLabel, searchText, isLabel, type });
  React.useEffect(() => {
    searchText &&
      searchDiscogs({
        [isLabel ? "label" : "q"]: searchText,
        type: "albums"
      }).then(data => {
        console.log(data.results.map(({ title }) => title));
      });
  }, [searchText]);

  return <Discogs.Search query={{ searchText, isLabel, type: "artist" }} />;
};

const DiscogsWrapper = props => React.createElement(Discogs.Wrapper, props);

export default DiscogsWrapper;

export const DiscogsContext = Discogs.Context;
