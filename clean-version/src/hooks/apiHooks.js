import { useState } from 'react'

const useKeepFetching = addData => {
  const [fetchingNext, setFetching] = useState(false)

  const showAll = async next => {// little bit of recurssion
    if (next && fetchingNext) {
      let nextNext = await addData(next)
      showAll(nextNext)
    }
    setFetching(false)
  }
  const stopFetching = setFetching(false)

  return [showAll, stopFetching]
}

export {
  useKeepFetching,
}