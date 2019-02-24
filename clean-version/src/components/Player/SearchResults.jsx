import React from 'react'

import Pagination from '../common/Pagination'
import { play } from '../../api/spotify'
import { types } from './Search'

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


const SearchResults = ({ data, onPageChange, addData }) => {
	if ( !data  ) {
		return  <span id="search-results" />
	}
	const [ type ] = types.map( t => t + "s" ).filter( t => data[t] )
	
	let { offset, limit, total, items, previous, next } = data[type]

	return items.length ?(
		<>
			<Pagination
				count={items.length}
				limit={limit}
				total={total}
				offset={offset}
				onPageChange={onPageChange}
				previous={previous}
				next={next}
				addData={addData}
			/>
			<ul className="results" id="search-results" >
				{ items.map( ({ name, id, uri, popularity })  => (
				<li className="results__item" key={id} onClick={() => handlePlay( type, uri ) } >
					{[ name, popularity ? `(${popularity})`: "" ].filter(Boolean).join(", ")}
				</li>
			))}
			</ul>
		</>
	): <p id="search-results" >no results</p>
}

export default SearchResults
