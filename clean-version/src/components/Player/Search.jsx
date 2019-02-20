import React, { useContext, useState, createContext } from 'react'

import { useHandleChange/* , useColorOnInput */ } from '../../hooks'

import { searchSpotify } from '../../api/spotify.js'
import { Utils } from '../../helpers'
import SearchIcon from '../../images/custom-svgs/SearchIcon'
import Results from './SearchResults'

export const SearchResultsContext = createContext({})

export const types = [ 'track', 'artist', 'album', 'playlist' ]

const useType = () => {
	const [ type, setType ]  = useState( sessionStorage.searchTermType || types[0] )

	const setAndStoreType = newType => {
		sessionStorage.setItem( 'searchTermType', newType )
		setType( newType )
	}
	return [ type, setAndStoreType ]
}

const Search = () => {
	const [ data, setData ] = useContext( SearchResultsContext )
	const [ type, setType ]  = useType()

	const [ formState, setFormState ] =  useHandleChange({ type, searchText: "", searchLabel: false })
	const [ prevFormState, setLastSearchObject] = useState({})

	let [ resultsPageOffset, setResultsPageOffset ] = useState(0)
	const [ isFetching, setFetching] = useState( false )
	const [ isError, setError] = useState( false )
	// const [ data, setData ] = useState( null )

	const flashError = () => {
		setError( true )
		setTimeout( () => {
			setError( false )
		}, 750 )
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		const { searchLabel, searchText, type } = formState
		if ( !searchText.length ) {
			flashError()
			return
		}
		if ( prevFormState !== formState) {
			resultsPageOffset = 0
		}
		setFetching(true)
		try {
			const res = await searchSpotify( searchLabel ? `label:${searchText}`: searchText, type )
			Utils.scrollIntoView("search-results")
			setLastSearchObject(formState)
			setData( res )
		} catch (error) {
			console.error(error)
			flashError()
		}
		setFetching(false)
	}
	
	return(
		<>
			<form id="search" onSubmit={handleSubmit} onChange={setFormState}>
				<div  className="search-bar">
					<input
						name="searchText"
						aria-label="search-input"
						tabIndex="1"
						className="query"
						type="text"
						defaultValue={formState.searchText}
						placeholder="Search spotify"
						autoComplete="off"
					/>
					<button className="submit" type="submit" >
						<SearchIcon isLoading={isFetching} isError={isError} />
					</button>
				</div>
				<div className="search-bar select-types" >
					<label htmlFor="label-check" tabIndex="3" >by label<input id="label-check" type="checkbox" checked={formState.searchLabel} name="searchLabel" /></label>
					
					<select tabIndex="2" name="type" defaultValue={type} onChange={ ({ target }) => setType(target.value) }>
						{types.map( (ty) =>
						<option key={ty} name={ty} value={ty}>{ty}</option>
						)}
					</select>
				</div>
			</form>
		</>
	)
}


export default Search
