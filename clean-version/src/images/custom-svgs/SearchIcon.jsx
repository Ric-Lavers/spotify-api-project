import React from 'react';


const SearchIcon = ({ isLoading }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72.04 72.04">
		<circle id="search__loading-circle" className="search__loading-circle" cx="30" cy="30" r="25"/>
		<path d="M30,0A30,30,0,1,0,49,53.21L66.88,71.12A3,3,0,0,0,71.19,67l-.07-.07L53.21,49A30,30,0,0,0,30,0Zm0,6A24,24,0,1,1,6,30,24,24,0,0,1,30,6Z"/>
		
		{isLoading && <animate 
				href="#search__loading-circle"
				attributeName="r"
				
				values="24;0;24" 
				dur="0.75s"
				fill="freeze" 
				repeatCount='indefinite'
				/>}
	</svg>
)

export default SearchIcon