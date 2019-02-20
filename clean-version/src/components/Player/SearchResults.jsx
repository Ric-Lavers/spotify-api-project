import React, { useContext } from 'react'

import { SearchResultsContext } from './Search'
import Pagination from '../common/Pagination'
import { play } from '../../api/spotify'
import { types } from './Search'


const SearchResultsContatiner = (props) => {
	const [ data ] = useContext( SearchResultsContext )
	if ( !data || !Object.keys(data).length  ) {
		return  <span id="search-results" />
	}

	return <SearchResults data={data} {...props} />
}



export const handlePlay = (type, uri) => {
	let body = {}
	if ( type === 'tracks' ) {
		body = {uris: [uri]}
	}else if  ( type === 'albums' ){
		body = {context_uri: uri}
	}else {
		body = {context_uri: uri}
	}
	play(body)
}


const SearchResults = ({ data }) => {
	const [ type ] = types.map( t => t + "s" ).filter( t => data[t] )
	
	let { offset, limit, total, items } = data[type]

	return items.length ?(
		<div className="results" >
			{/* <Pagination count={items.length} limit={limit} total={total} offset={offset} onPageChange={onPageChange} /> */}
			<ul id="search-results" >
				{ items.map( ({ name, id, uri, popularity })  => (
				<li className="results__item" key={id} onClick={() => handlePlay( type, uri ) } >
					{[ name, popularity ? `(${popularity})`: "" ].filter(Boolean).join(", ")}
				</li>
			))}
			</ul>
		</div>
	): <p id="search-results" >no results</p>
}

export default SearchResultsContatiner
