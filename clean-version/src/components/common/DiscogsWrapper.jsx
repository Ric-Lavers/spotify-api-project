import React from "react";

import { useHandleChange } from "../../hooks/commonHooks";
import { Utils } from "../../helpers";
import { searchSpotify } from "../../api/spotify";
import SearchIcon from "../../images/custom-svgs/SearchIcon";

import Search from "../Player/Search";

let DiscogsSearch = {
  Shell: "",
  Wrapper: ""
};

DiscogsSearch.Template = ({
  onSubmit,
  onChange,
  toggleIsLabel,
  formState = { isLabel: "{isLabel}", searchText: "{searchText}" },
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
          placeholder="Search spotify"
          autoComplete="off"
          type="text"
          className="query"
          name="searchText"
          tabIndex="1"
          aria-label="search-input"
        />
        <button className="submit" type="submit" alt="submit">
          <SearchIcon isLoading={isFetching} isError={isError} />
        </button>
      </div>
      <div className="search-bar select-types">
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
      </div>
    </form>
  </>
);
DiscogsSearch.Constants = {
  types: ["track", "artist", "album", "playlist"]
};
DiscogsSearch.Search = ({ query, setData }) => {
  //Constants
  let types;
  types = DiscogsSearch.Constants.types;
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

  return React.createElement(DiscogsSearch.Template, {
    onSubmit,
    onChange,
    toggleIsLabel,
    formState: { isLabel: "{isLabel}", searchText: "{searchText}" },
    isFetching,
    isError: hasError,
    type,
    setType,
    types
  });
};

DiscogsSearch.Context = React.createContext({
  data: {}
});

DiscogsSearch.Wrapper = ({ recordLabel }) => {
  let query = {
    type: "album",
    searchText: "pampa".replace(/records/g, ""),
    searchLabel: true
  };
  console.log("recordLabel", recordLabel);

  return <DiscogsSearch.Search query={query} />;
};

const DiscogsWrapper = props =>
  React.createElement(DiscogsSearch.Wrapper, props);

export default DiscogsWrapper;

export const DiscogsSearchContext = DiscogsSearch.Context;

// DiscogsSearch.Search = () => {
//   /**
//    * EVENTS
//    */

//   /**
//    * ACTIONS
//    */
//   function handleSubmit() {}
//   function handleFormState() {}
//   const isFetching = false;
//   const isError = false;
//   const type = "album";
//   const setType = () => console.log("?setType");
//   const types = [];

//   return React.createElement(DiscogsSearch.Template, {
//     handleSubmit,
//     handleFormState,
//     formState: { searchLabel: "{searchLabel}", searchText: "{searchText}" },
//     isFetching,
//     isError,
//     type,
//     setType,
//     types
//   });
// };
