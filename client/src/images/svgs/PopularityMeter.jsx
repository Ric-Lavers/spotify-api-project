import React from 'react'

const PopularityMeter = ({popularity}) => 
  <svg 
    xmlns = "http://www.w3.org/2000/svg"
    viewBox = "0 0 500 100" 
    width="100px"
    height="20px"
  >
    <g>
      <rect width="500" height="100" 
      style={ {stroke: 'black', fill: 'none'} }
      />
      <rect 
      style={ {stroke: 'black', fill: 'lime'} }
      width={500 * (popularity / 100) } height="100" />
    </g>
  </svg>

export default PopularityMeter