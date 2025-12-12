import React from 'react'

const Minus = ({ onClick, inactive = false }) => (
  <div
    onClick={() => !inactive && onClick()}
    className={`plus ${inactive ? 'disabled' : ''}`}
  >
    <svg
      role="img"
      height="12"
      width="12"
      viewBox="0 0 16 16"
      style={{ fill: 'currentcolor' }}
    >
      <line
        x1="2"
        x2="14"
        y1="8"
        y2="8"
        stroke-width="2px"
        stroke="black"
      ></line>
    </svg>
  </div>
)

export default Minus
