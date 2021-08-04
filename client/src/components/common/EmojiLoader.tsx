import React from 'react'

interface Props {
  status: 'loading' | 'error' | 'success'
}

const EmojiLoader: React.FC<Props> = ({ status }) => {
  switch (status) {
    case 'loading':
      return <>🤞</>
    case 'success':
      return <>👍</>
    case 'error':
      return <>👎</>
    default:
      return <></>
  }
}

export default EmojiLoader
