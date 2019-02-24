import React, { useEffect, useState } from 'react'

import { fetchUrl } from '../../api/spotify'

import { ReactComponent as ArrowRight} from '../../images/custom-svgs/arrow-right.svg'
import { ReactComponent as ArrowLeft} from '../../images/custom-svgs/arrow-left.svg'
import { ReactComponent as ArrowDown} from '../../images/custom-svgs/arrow-down.svg'
import { ReactComponent as ArrowUp} from '../../images/custom-svgs/arrow-up.svg'
// import { ReactComponent as Circle} from '../../images/custom-svgs/circle.svg'
import Circle from '../../images/custom-svgs/CircleSvg'

const Pagination = ({ onPageChange, onClick, numOfPages, pages, offset, limit, next, previous, addData, counting }) => {
	return (
		<>
		<div className="pagination">
			<ArrowUp onClick={() => {addData(fetchUrl(previous))}}/>
		</div>
		<div className="pagination" >
			<Circle onClick={() => onPageChange(0)} 
			 offset={'1'} className="min-max" style={{ opacity: offset === 0 ? 0 : 0.4}} />
			<ArrowLeft onClick={() => onClick(-1)} style={{ opacity: offset === 0 ? 0 : 1}}/>
			{pages}
			<ArrowRight onClick={() => onClick(1)} style={{ opacity: offset === numOfPages ? 0 : 1}} />
			<Circle onClick={() => onPageChange(numOfPages * limit)} 
			offset={numOfPages+1} className="min-max" style={{opacity: offset === numOfPages? 0 : 0.4}} />
		</div>
		{ Array(counting.nextCount).fill(1).map( _ =>  <div className="pagination" ><Circle className="min-max" /></div> ) }
		
		<div className="pagination">
			<ArrowDown onClick={() => {
				addData(fetchUrl(next))
				counting.addNextCount()
				}}/>
		</div>
		</>
	)
}

const useCount = intial => {
	const [ count, setCount ] = useState(intial)

	const addOne = () => {
		setCount( count + 1 )
	}

	return [ count, addOne ]
}

const PaginationContainer = ({ total, limit, offset, onPageChange, ...props}) => {

	const [pages, setPages] = useState([])
	
	const [ nextCount, addNextCount ] = useCount(0)
	const [ prevCount, addPrevCount ] = useCount(0)
	const counting = {
		nextCount, addNextCount,
		prevCount, addPrevCount
	}

	let numOfPages =  total/ limit|0
	if ( !numOfPages ) {
		return null
	}

	useEffect( () => {
		// console.log(  numOfPages - (offset/ limit + 1) )
		const pages = []		
		for(let i = 0; i < total/limit |0 ; i++){
			let isSelected = i === offset / limit % 10

			pages.push( <Circle onClick={() => onPageChange(offset + i*limit)} offset={ isSelected && offset/ limit + 1} style={isSelected ? {} : { opacity: 0.2 }} /> )
			if ( i === 9   ) break;
		}
		setPages( pages )
	}, [offset] )
	

	const handlePageChange = direction => {
		let nextOffset = (offset + (direction * limit)) % total
		console.log( nextOffset )
		onPageChange(nextOffset >= limit ? nextOffset : 0)
	}
	

	return (
		<Pagination numOfPages={numOfPages} offset={offset/ limit} onClick={handlePageChange} pages={pages} counting={counting} {...props}/>
	)
}

export default PaginationContainer
