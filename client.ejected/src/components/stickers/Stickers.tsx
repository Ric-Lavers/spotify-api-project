//@ts-nocheck
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { PartyBlendSticker } from 'images/PartyBlendSticker'
import { Range, getTrackBackground } from 'react-range'
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
  const [cutlineColor, setCutlineColor] = useState('#010939')

  return (
    <div className="Stickers">
      <details>
        <summary>add a sticker</summary>
        <CreateStickers
          useNewStickerForm={useNewStickerForm}
          loading={loading}
        />
      </details>
      <label for="colorPicker">
        cut line colour:
        <input
          onChange={({ target: { value } }) => setCutlineColor(value)}
          type="color"
          value={cutlineColor}
          id="colorPicker"
        ></input>
      </label>

      {stickers.map((sticker, i) => (
        <Sticker {...sticker} i={i} cutlineColor={cutlineColor} />
      ))}
      <CallToActionSticker />
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

const Sticker = ({
  id,
  party_blend_id,
  slug,
  title,
  initialNumber = 0,
  cutlineColor,
}) => {
  const history = useHistory()
  const [initialRepeatBy = initialNumber] = new URLSearchParams(
    window.location.search
  ).getAll(String(id))
  const [repeatBy, setRepeatBy] = useState<number>(Number(initialRepeatBy))

  function handleRepeatByChange({ target: { value } }) {
    const search = new URLSearchParams(window.location.search)
    search.set(id, value)
    if (value === '0') {
      search.delete(id)
    }

    history.replace(`${window.location.pathname}?${search.toString()}`)
    setRepeatBy(parseInt(value))
  }

  return (
    <>
      <label>
        {slug} - Repeat count:
        <input
          type="number"
          value={repeatBy}
          onChange={handleRepeatByChange}
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
                    cutlineColor={cutlineColor}
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
      {repeatBy >= 1 && <p style={{ pageBreakAfter: 'always' }}>&nbsp;</p>}
    </>
  )
}
const CallToActionSticker = ({}) => {
  const [phrase, setPhrase] = useState('')
  const [repeatBy, setRepeatBy] = useState(0)
  const [width, setWidth] = useState(300)

  return (
    <div>
      <form className="phrases-form">
        <label for="myHouse">
          Pick a Phrase
          <input
            list="phrases"
            id="select-phrases"
            name="phrase"
            placeholder="call to action"
            onChange={({ target: { value } }) => setPhrase(value)}
          />
        </label>
        <label>
          Repeat count:
          <input
            type="number"
            value={repeatBy}
            onChange={({ target: { value } }) => setRepeatBy(parseInt(value))}
            min="0"
          />
        </label>
        <br />
        <label>
          width:
          <input
            type="number"
            value={width}
            onChange={({ target: { value } }) => setWidth(parseInt(value))}
            min="100"
            max="600"
          />
        </label>
        <datalist id="phrases">
          {phrases.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </form>

      <br />

      <div
        className="phrases-container"
        style={{
          gridTemplateColumns: `repeat(auto-fit, ${width}px)`,
        }}
      >
        {phrase &&
          Array(repeatBy)
            .fill('')
            .map((_, ii) => (
              <div style={{ maxWidth: width }} className="sticker">
                <Phrase phrase={phrase} />
              </div>
            ))}
      </div>
    </div>
  )
}

const Phrase = ({ phrase }) => <div className="phrase">{phrase}</div>

const phrases = [
  'share & contribute',
  ' contribute your music',
  'your music, and ours',
  ' our playlist with you',
  ' with you, we party',
  'we party, to your music',
  ' party, to our music',
]

export default Stickers
