import React from 'react'

const Plus = ({ onClick, inactive = false }) => (
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
      <path d="M14 7H9V2H7v5H2v2h5v5h2V9h5z"></path>
      <path fill="none" d="M0 0h16v16H0z"></path>
    </svg>
  </div>
)

export default Plus
