import React, { memo, createContext, useState } from 'react'

export const FetchContext = createContext((key, fn) => fn())

export const FetchProvider = memo(({ children }) => {
  const [datas, setData] = useState({})
  const checkCache = async (key, fn) => {
    if (datas[key]) return datas[key]
    const pending = fn()
    setData((d) => ({ ...d, [key]: pending }))
    // const data = await fn().then((d) => {
    //   setData((d) => ({ ...d, [key]: d }))
    //   return d
    // })

    return pending
  }
  return (
    <FetchContext.Provider value={checkCache}>{children}</FetchContext.Provider>
  )
})
