import React, { useEffect, useState } from 'react'

import { ReactComponent as ArrowRight } from '../../images/custom-svgs/arrow-right.svg'
import { ReactComponent as ArrowLeft } from '../../images/custom-svgs/arrow-left.svg'
// import { ReactComponent as Circle} from '../../images/custom-svgs/circle.svg'
import Circle from '../../images/custom-svgs/CircleSvg'

const Pagination = ({
  onPageChange,
  onClick,
  numOfPages,
  pages,
  offset,
  limit,
}) => {
  return (
    <div className="pagination">
      <Circle
        onClick={() => onPageChange(0)}
        offset={'1'}
        className="min-max"
        style={{ opacity: offset === 0 ? 0 : 0.4 }}
      />
      <ArrowLeft
        onClick={() => onClick(-1)}
        style={{ opacity: offset === 0 ? 0 : 1 }}
      />
      {pages}
      <ArrowRight onClick={() => onClick(1)} />
      <Circle
        onClick={() => onPageChange(numOfPages * limit)}
        offset={numOfPages + 1}
        className="min-max"
        style={{ opacity: offset === numOfPages ? 0 : 0.4 }}
      />
    </div>
  )
}

const PaginationContainer = ({ total, limit, offset, onPageChange }) => {
  const [pages, setPages] = useState([])
  let numOfPages = (total / limit) | 0

  useEffect(() => {
    if (numOfPages) {
      const pages = []
      for (let i = 0; (i < total / limit) | 0; i++) {
        let isSelected = i === (offset / limit) % 10

        pages.push(
          <Circle
            onClick={() => onPageChange(offset + i * limit)}
            offset={isSelected && offset / limit + 1}
            style={isSelected ? {} : { opacity: 0.2 }}
          />
        )
        if (i === 9) break
      }
      setPages(pages)
    }
  }, [limit, offset, onPageChange, total])

  const handlePageChange = (direction) => {
    let nextOffset = (offset + direction * limit) % total
    onPageChange(nextOffset >= limit ? nextOffset : 0)
  }
  if (!numOfPages) {
    return null
  }
  return (
    <Pagination
      onPageChange={onPageChange}
      numOfPages={numOfPages}
      offset={offset / limit}
      pages={pages}
      onClick={handlePageChange}
      limit={limit}
    />
  )
}

export default PaginationContainer
