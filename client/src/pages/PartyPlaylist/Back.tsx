import React from 'react'

import { ReactComponent as BackArrow } from '../../images/back.svg'

const Back = ({ onClick, disabled = '', title = 'Go back' }) => {
  return (
    <button
      onClick={onClick}
      data-testid="top-bar-back-button"
      aria-hidden="true"
      aria-label="Go back"
      disabled={Boolean(disabled)}
      className="back-button "
      title={title}
    >
      <BackArrow />
    </button>
  )
}

export default Back
