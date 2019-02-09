import React, { useMemo } from 'react'

import { play } from '../../api/spotify'
import { types } from './Search'

export const handlePlay = (type, uri) => {
	let body = {}
	if ( type === 'track' ) {
		body = {uris: [uri]}
	}else {
		body = {context_uri: uri}
	}
	play(body)
}


const SearchResults = ({ data }) => {
	if ( !data  ) {
		return  <span id="search-results" />
	}
	const [ type ] = types.map( t => t + "s" ).filter( t => data[t] )
	
	const items = data[type].items

	return items.length ?(
		<ul className="results" id="search-results" >
			{ items.map( ({ name, id, uri, popularity })  => (
			<li className="results__item" key={id} onClick={() => handlePlay( type, uri ) } >
				{[ name, popularity ? `(${popularity})`: "" ].filter(Boolean).join(", ")}
			</li>
		))}
		</ul>
	): <p id="search-results" >no results</p>
}

export default SearchResults
