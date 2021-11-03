//@ts-nocheck
import React, { useEffect, useState } from 'react'
import { PartyBlendSticker } from 'images/PartyBlendSticker'
import {
  getRedirectForStickers,
  createRedirectForStickers,
} from 'api/party-playlist'

const useStickersData = () => {
  const [stickers, setStickers] = useState([])
  useEffect(() => {
    getRedirectForStickers().then(setStickers)
  }, [])

  const [loading, setL] = useState(false)
  const [inputs, setNewSticker] = useState({
    password: '',
    party_blend_id: '',
    slug: '',
    title: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setL(true)
    createRedirectForStickers(inputs)
      .then((sticker) => setStickers((prev) => [...sticker, ...prev]))
      .catch(console.error)
      .finally(() => setL(false))
  }

  return {
    stickers,
    loading,
    useNewStickerForm: [inputs, setNewSticker, handleSubmit],
  }
}

const Stickers: React.FC<{}> = () => {
  const { stickers, loading, useNewStickerForm } = useStickersData()

  return (
    <div className="Stickers">
      <CreateStickers useNewStickerForm={useNewStickerForm} loading={loading} />
      {stickers.map((sticker, i) => (
        <Sticker {...sticker} i={i} />
      ))}
    </div>
  )
}
const CreateStickers = ({ useNewStickerForm, loading }) => {
  const [{ party_blend_id, slug, title, password }, setNewSticker, onSubmit] =
    useNewStickerForm
  return (
    <form
      onSubmit={onSubmit}
      onChange={({ target: { value, name } }) =>
        setNewSticker((prev) => ({ ...prev, [name]: value }))
      }
    >
      <fieldset>
        <legend>Make new sticker</legend>
        <label>
          password
          <input required type="password" value={password} name="password" />
        </label>
        <label>
          blend id{' '}
          <input required value={party_blend_id} name="party_blend_id" />
        </label>
        <label>
          slug <input value={slug} name="slug" />
        </label>
        <display></display>
        <label>
          title <input value={title} name="title" />
        </label>
        <input disabled={loading} type="submit" value="create" />
      </fieldset>
    </form>
  )
}

const Sticker = ({ id, party_blend_id, slug, title }) => {
  const [repeatBy, setRepeatBy] = useState<number>(1)

  return (
    <>
      <label>
        {slug} - Repeat count:
        <input
          type="number"
          value={repeatBy}
          onChange={({ target: { value } }) => setRepeatBy(parseInt(value))}
          min="0"
        />
      </label>
      <div className="sticker-container">
        {repeatBy >= 1 &&
          Array(repeatBy)
            .fill('')
            .map((_, ii) => (
              <div key={ii} className="sticker">
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
    </>
  )
}

export default Stickers
