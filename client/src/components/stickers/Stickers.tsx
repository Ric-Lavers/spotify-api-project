//@ts-nocheck
import React, { useEffect, useState } from 'react'
import { PartyBlendSticker } from 'images/PartyBlendSticker'
import { getRedirectForStickers } from 'api/party-playlist'

const useStickersData = () => {
  const [stickers, setStickers] = useState([])
  useEffect(() => {
    getRedirectForStickers().then(setStickers)
  }, [])
  return stickers
}

const Stickers: React.FC<{}> = () => {
  const stickers = useStickersData()

  return (
    <div className="Stickers">
      {stickers.map(({ id, party_blend_id, slug, title }, i) => (
        <div className="sticker">
          <div className="sticker_svg">
            <PartyBlendSticker
              qrCodeHref={`${process.env.REACT_APP_BASE_SERVER_URL}redirects/${id}`}
            />
          </div>
          <br />
          <div className="sticker_details">
            <span className="sticker_id">{id}</span>
            <span className="sticker_title">{slug || title}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Stickers
