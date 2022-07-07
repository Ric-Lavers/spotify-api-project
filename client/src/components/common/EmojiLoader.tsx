import React from 'react'

export type Statuses = 'loading' | 'error' | 'success' | ''
interface Props {
  status: Statuses
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
