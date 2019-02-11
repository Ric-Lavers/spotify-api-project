import React, { useState} from 'react'
import Switch from 'react-switch'

import { useToggle, useHandleChange, useColorOnInput } from '../../hooks'
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

	const [ type, setType ]  = useType()
	const [ inputStyle, setColorOnInput ] = useColorOnInput()
	// const [ formState, setFormState ] = useState({ type })

	const [ formState, setFormState ] =  useHandleChange({ type })

	const [ isFetching, setFetching] = useState( false )
	const [ data, setData ] = useState( null )

	const handleSubmit = async (e) => {
		e.preventDefault()
		const { searchLabel, searchText, type } = formState
		setFetching(true)
		try {
			const res = await searchSpotify( searchLabel ? `label:${searchText}`: searchText, type )
			Utils.scrollIntoView("search-results")
			setData( res )
		} catch (error) {
		}
		setFetching(false)
	}
/* 
	const useFormChange = ({ target }) => {
		let { name, value, checked, type } = target
		if (type === 'checkbox') value = checked
		setFormState({ ...formState, [name]: value }) 
	}  */

	return(
		<>
			<form style={ inputStyle } onSubmit={handleSubmit} onChange={setFormState}>
				<div  className="search-bar">
					<input
						name="searchText"
						tabIndex="1"
						className="query"
						type="text"
						value={formState.searchText}
						placeholder="Search spotify"
						autoComplete="off"
						onChange={setColorOnInput}
					/>
					<button className="submit" type="submit" >
						<SearchIcon isLoading={isFetching} />
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
			<Results type={type} data={data} />
		</>
	)
}


export default Search
