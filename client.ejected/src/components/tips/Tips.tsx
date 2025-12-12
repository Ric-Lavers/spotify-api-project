import React, { useEffect, useState } from 'react'

import Forward from '../../pages/PartyPlaylist/Forward'
/**
 * show tips to teach people how to use the app,
 *
 * best time would be to cycle through during initialisation.
 */
const Tips = ({ tips = _tips }) => {
  const [tipIndex, setTipIndex] = useState(
    Math.floor(Math.random() * tips.length)
  )

  const { description } = tips[tipIndex]
  function nextTip() {
    setTipIndex((tipIndex + 1) % tips.length)
  }
  useEffect(() => {
    const id = setTimeout(() => {
      nextTip()
    }, 7000)
    return () => clearTimeout(id)
  }, [tipIndex])

  return (
    <div className="Tips">
      <div>
        <div className="Tips_title">Hot tip</div>
        <p className="Tips_description">{description} </p>
      </div>
      <div className="Tips_footer">
        <Forward onClick={nextTip} />
      </div>
    </div>
  )
}

var _tips = [
  {
    description: 'you can sort your playlists then save those to your spotify',
  },
  {
    description:
      'provide feedback for Party Blends at the link at the bottom of the page',
  },
  {
    description: 'your tracks are from your most played over the last month',
  },
  {
    description:
      'we only collect the minimum data required to run the app and delete it if you leave',
  },
]

export default Tips
