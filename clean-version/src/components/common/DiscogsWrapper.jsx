import React from "react";
// import { Machine, assign } from "xstate";
// import { useSetState } from "react-use";

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
  const [, _setData] = React.useContext(DiscogsSearch.Context);
  let query = {
    type: "album",
    searchText: recordLabel.replace(/records/g, ""),
    isLabel: true
  };

  /* ACTIONS */
  const setData = _setData;

  return <DiscogsSearch.Search query={query} setData={setData} />;
};

const DiscogsWrapper = ({ recordLabel, data }) => Search.Wrapper;

export default DiscogsWrapper;
export const DiscogsSearchContext = DiscogsSearch.Context;
/* 
DiscogsSearch.machine = () => {
  const fetchMachine = Machine(
    {
      id: "fetch",
      initial: "idle",
      context: {
        retries: 0
      },
      states: {
        idle: {
          on: {
            FETCH: "loading"
          }
        },
        loading: {
          on: {
            RESOLVE: "success",
            REJECT: "failure"
          }
        },
        success: {
          type: "final"
        },
        failure: {
          on: {
            RETRY: {
              target: "loading",
              actions: "addToRetry"
            }
          }
        }
      }
    },
    {
      services: {
        invokeGetWordByGroup: ({
          type,
          searchTerm
        }, event) => searchSpotify(query, type),
        invokeAddWordToGroup: ({
            groupName
          }, {
            word
          }) =>
          addWord(word, groupName),
      },
      actions: {
        addToRetry: assign((context, event) => {
          return {
            retries: context.retries + 1
          };
        }),

        reset: assign((context, event) => {
          return {
            word: "",
            words: event.data.words
          };
        })
      }
    }
  );
}; */
