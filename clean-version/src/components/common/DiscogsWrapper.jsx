import React from "react";
import { Machine, assign } from "xstate";

import { searchSpotify } from "../../api/spotify";
import SearchIcon from "../../images/custom-svgs/SearchIcon";

import Search from "../Player/Search";

let DiscogsSearch = {
  Shell: "",
  Wrapper: ""
};

DiscogsSearch.Template = ({
  handleSubmit,
  handleFormState,
  formState = { searchLabel: "{searchLabel}", searchText: "{searchText}" },
  isFetching,
  isError,
  type,
  setType,
  types
}) => (
  <>
    <form id="search" onSubmit={handleSubmit} onChange={handleFormState}>
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
            onChange={handleFormState}
            checked={formState.searchLabel}
            id="label-check"
            type="checkbox"
            name="searchLabel"
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
};

DiscogsSearch.Search = () => {
  /**
   * EVENTS
   */

  /**
   * ACTIONS
   */
  function handleSubmit() {}
  function handleFormState() {}

  return React.createElement(DiscogsSearch.Template, {
    handleSubmit,
    handleFormState,
    formState: { searchLabel: "{searchLabel}", searchText: "{searchText}" },
    isFetching,
    isError,
    type,
    setType,
    types
  });
};

DiscogsSearch.Wrapper = ({ recordLabel }) => {
  let query = {
    type: "album",
    searchText: "pampa".replace(/records/g, ""),
    searchLabel: true
  };

  return <DiscogsSearch.Search query={query} />;
};

const DiscogsWrapper = ({ recordLabel }) => Search.Wrapper;
export default DiscogsWrapper;
