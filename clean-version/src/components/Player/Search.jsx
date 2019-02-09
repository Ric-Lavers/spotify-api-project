import React, { useState, useContext} from 'react'
import { useToggle } from '../../hooks'
import { CurrentPlayingContext } from '../../context'

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

	const [ searchText, setSearch ] = useState("")
	const [ type, setType ]  = useType()
	const [ isFetching, setFetching] = useState( false )
	const [ data, setData ] = useState( null )
	const [ searchLabel, toggleLabel ] = useToggle( false )

	const handleChange = ({ value }) => setSearch( value )
	const handleSubmit = async (e) => {
		e.preventDefault()
		setFetching(true)
		const res = await searchSpotify( searchLabel ? `label:${searchText}`: searchText, type )
		if (res ){
			setData( res )
			Utils.scrollIntoView("search-results")
		}
		setFetching(false)
	}
	
	return(
		<>
			<form  onSubmit={handleSubmit}>
				<div className="search-bar">
					<input
						tabIndex="1"
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
					<label tabIndex="3" >by label<input type="checkbox" checked={searchLabel} name="label" onChange={toggleLabel} /></label>
					<select tabIndex="2" name="type" defaultValue={type} onChange={ ({ target }) => setType(target.value) }>
						{types.map( (ty) =>
						<option key={ty} name={ty} value={ty}>{ty}</option>
						)}
					</select>
				</div>
			</form>
			<Results type={type} data={data} />
		</>
	)
}


export default Search
