import React, { useState, useEffect, useRef } from 'react'

import { useHandleChange/* , useColorOnInput */ } from '../../hooks'

import { searchSpotify } from '../../api/spotify.js'
import { Utils } from '../../helpers'
import SearchIcon from '../../images/custom-svgs/SearchIcon'
import Results from './SearchResults'

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
	const mounted = useRef();
	const [ type, setType ]  = useType()
	// const [ inputStyle, setColorOnInput ] = useColorOnInput()

	const [ formState, setFormState ] =  useHandleChange({ type, searchText: "", searchLabel: false })
	const [ prevFormState, setLastSearchObject] = useState({})

	let [ resultsPageOffset, setResultsPageOffset ] = useState(0)
	const [ isFetching, setFetching] = useState( false )
	const [ isError, setError] = useState( false )
	const [ data, setData ] = useState( null )

	const flashError = () => {
		setError( true )
		setTimeout( () => {
			setError( false )
		}, 750 )
	}

	useEffect(() => {
		handleSubmit()	
	}, [resultsPageOffset])

	const handleSubmit = async (e) => {
		e && e.preventDefault()
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
			const res = await searchSpotify( searchLabel ? `label:${searchText}`: searchText, type, {offset: resultsPageOffset, limit: 20} )
			Utils.scrollIntoView("search-results")
			setLastSearchObject(formState)
			setData( res )
		} catch (error) {
			flashError()
		}
		setFetching(false)
	}

	const handlePageChange = offset => {
		console.log("handlePageChange ", offset )
		setResultsPageOffset( offset )
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
						value={formState.searchText}
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
			<Results type={type} data={data} onPageChange={handlePageChange} />
		</>
	)
}


export default Search
