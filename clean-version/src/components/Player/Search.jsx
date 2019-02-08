import React, { useState, useMemo } from 'react'
import { searchSpotify, play } from '../../api/spotify.js'
import SearchIcon from '../../images/custom-svgs/SearchIcon'

const types = [ 'track', 'artist', 'album', 'playlist' ]

const Search = () => {
	const [ searchText, setSearch ] = useState("")
	const [typeIndex, setType ]  = useState( 0 )
	const [ isFetching, setFetching] = useState( false )
	const [ data, setData ] = useState( null )

	const handleChange = ({ value }) => setSearch( value )
	const handleSubmit = async (e) => {
		e.preventDefault()
		setFetching(true)
		const res = await searchSpotify( searchText, types[typeIndex] )
		res && setData( res )
		setFetching(false)
	}

	return(
		<>
		<form className="search-bar" onSubmit={handleSubmit}>
			<input
				className="query"
				type="text"
				value={searchText}
				placeholder="Search spotify"
				onChange={({ target }) => handleChange(target)}
			/>
		{/* 	<label> {types[typeIndex]}
				<input
					type="button"
					onClick={() => setType( (typeIndex + 1) % types.length )}
				/>
			</label> */}
			<button className="submit" type="submit" >
				<SearchIcon isLoading={isFetching} />
			</button>
		</form>
		<Results type={types[typeIndex]} data={data} />
		</>
	)
}

const Results = ({ type, data }) => {
	if ( !data ) {
		return  null
	}
	const items = data[`${type}s`].items

	return items.length ?(
		<ul className="results" >
			{ items.map( ({ name, id, uri })  => (
			<li className="results__item" key={id} onClick={ () => play({uris: [uri]}) } >{ name}</li>
		))}
		</ul>
	): <p>no results</p>

}

export default Search
