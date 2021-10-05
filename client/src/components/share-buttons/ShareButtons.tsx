//@ts-nocheck
import React from 'react'
import {
  WhatsappShareButton,
  WhatsappIcon,
  FacebookMessengerShareButton,
  FacebookMessengerIcon,
  TelegramIcon,
  TelegramShareButton,
  TwitterShareButton,
  TwitterIcon,
  LineShareButton,
  LineIcon,
} from 'react-share'
import QRCode from 'react-qr-code'
import CopyToClipboard from 'react-copy-to-clipboard'

import IphoneMessageIcon from '../../images/iphone-message-icon.png'
import AndroidSMSIcon from '../../images/android-message-icon.svg'
import CopyToClipboardIcon from '../../images/copy-to-clipboard-icon.png'
import EmojiLoader, { Statuses } from 'components/common/EmojiLoader'
import { useState } from 'react'
import { useEffect } from 'react'

const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID
const is_iOSDevice = !!navigator.userAgent.match(/iPhone|iPod|iPad/)

export const ShareButtons: React.FC<{ url?: string; title?: string }> = ({
  url = window.location.href,
  title = 'hey join me on this party blend',
}) => {
  const [copyStatus, setCopyStatus] = useState<Statuses>('')
  useEffect(() => {
    if (copyStatus) {
      setTimeout(() => {
        setCopyStatus('')
      }, 3000)
    }
  }, [copyStatus])

  return (
    <>
      <div className="share-buttons">
        <CopyToClipboard
          text={window.location.href}
          onCopy={() => setCopyStatus('success')}
        >
          <div className="copy-to-clipboard">
            {copyStatus ? (
              <span>
                <EmojiLoader status={'success'} />
                <small>copied!</small>
              </span>
            ) : (
              <img
                src={CopyToClipboardIcon}
                height="32px"
                width="32px"
                style={{ padding: 4 }}
                title="copy to clipboard"
              />
            )}
          </div>
        </CopyToClipboard>
        <span className="mobile-share-buttons">
          <a href={`sms:?&body=${title}  ${url}`}>
            <img
              src={is_iOSDevice ? IphoneMessageIcon : AndroidSMSIcon}
              height="50px"
              width="50px"
              style={{ borderRadius: '50%' }}
            />
          </a>

          <WhatsappShareButton title={title} url={url}>
            <WhatsappIcon size={50} round />
          </WhatsappShareButton>
          {FACEBOOK_APP_ID && (
            <FacebookMessengerShareButton
              appId={FACEBOOK_APP_ID}
              title={title}
              url={url}
            >
              <FacebookMessengerIcon size={50} round />
            </FacebookMessengerShareButton>
          )}
          <TelegramShareButton url={url} title={title}>
            <TelegramIcon size={50} round />
          </TelegramShareButton>
          <LineShareButton url={url} title={title}>
            <LineIcon size={50} round />
          </LineShareButton>
          <TwitterShareButton url={url} title={title}>
            <TwitterIcon size={50} round />
          </TwitterShareButton>
        </span>
      </div>

      <div className="qr-code">
        <QRCode value={url} />
      </div>
    </>
  )
}
