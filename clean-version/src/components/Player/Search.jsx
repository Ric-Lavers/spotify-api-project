import React, { useState, useRef } from 'react'
import { useToggle } from '../../hooks'

import { searchSpotify } from '../../api/spotify.js'
import { SpotifyHelpers } from '../../helpers'
import SearchIcon from '../../images/custom-svgs/SearchIcon'
import Results from './SearchResults'

const types = [ 'track', 'artist', 'album', 'playlist' ]

const Search = () => {
	const [ searchText, setSearch ] = useState("")
	const [ type, setType ]  = useState( types[0] )
	const [ isFetching, setFetching] = useState( false )
	const [ data, setData ] = useState( null )
	const [ searchLabel, toggleLabel ] = useToggle( false )
	const resultsRef = useRef(null)

	const handleChange = ({ value }) => setSearch( value )
	const handleSubmit = async (e) => {
		e.preventDefault()
		setFetching(true)
		const res = await searchSpotify( searchLabel ? `label:${searchText}`: searchText, type )
		if (res){
			setData( res )
			SpotifyHelpers.scrollIntoView("search-results")
		}
		setFetching(false)
	}

	return(
		<>
			<form  onSubmit={handleSubmit}>
				<div className="search-bar">
					<input
						className="query"
						type="text"
						value={searchText}
						placeholder="Search spotify"
						onChange={({ target }) => handleChange(target)}
					/>
					<button className="submit" type="submit" >
						<SearchIcon isLoading={isFetching} />
					</button>
				</div>
				<div className="search-bar select-types" >
					<label>label<input type="checkbox" checked={searchLabel} name="label" onClick={toggleLabel} /></label>
					<select name="type" onChange={ ({ target }) => setType(target.value) }>
						{types.map( (type) =>
						<option value={type}>{type}</option>
						)}
					</select>
				</div>
			</form>
			<Results ref={resultsRef} type={type} data={data} />
		</>
	)
}


export default Search
