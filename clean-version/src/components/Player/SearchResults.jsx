import React, { useMemo } from 'react'

import { play } from '../../api/spotify'

export const handlePlay = (type, uri) => {
	let body = {}
	if ( type === 'track' ) {
		body = {uris: [uri]}
	}else {
		body = {context_uri: uri}
	}
	play(body)
}


const SearchResults = ({ type, data }) => {
	if ( !data || !data[`${type}s`] ) {
		return  null
	}
	const items = data[`${type}s`].items

	return items.length ?(
		<ul className="results" id="search-results" >
			{ items.map( ({ name, id, uri, popularity })  => (
			<li className="results__item" key={id} onClick={() => handlePlay( type, uri ) } >
				{[ name, popularity ? `(${popularity})`: "" ].filter(Boolean).join(", ")}
			</li>
		))}
		</ul>
	): <p>no results</p>
}

export default SearchResults
