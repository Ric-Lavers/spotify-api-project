import React from 'react'
import { ReactComponent as Kebab } from 'images/spotify-kabab.svg'

const KebabButton = ({ children, onClick, loadingStatus }) => {
  return (
    <div class="s-kebab">
      <button
        onClick={onClick}
        className="kebab-btn"
        type="button"
        aria-haspopup="menu"
        aria-label="More"
        title="More"
        aria-expanded="false"
      >
        {loadingStatus ? (
          <span className="loading-status">{loadingStatus}</span>
        ) : (
          <Kebab />
        )}
      </button>
      {children}
    </div>
  )
}

export default KebabButton
