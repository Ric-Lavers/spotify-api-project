import React from "react"
import get from "lodash.get"

export const CurrentPlaylist = ({ currentPlaylist }) => {
  if (!currentPlaylist) return null
  return (
    <div className="playlist-info">
      <h4>{currentPlaylist.name}</h4>
      {/* <p>{currentPlaylist.description}</p> */}
      <img src={get(currentPlaylist, "images[0].url")} alt="" srcset="" />
    </div>
  )
}
