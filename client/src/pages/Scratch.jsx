import React, { useState, useEffect, useContext } from 'react'

import { GlobalContext } from 'globalContext'
import { PlaylistRemover } from 'components/playlist-remover/PlaylistRemover'
import { getUserPartyPlaylists } from '../api/party-playlist'

const useData = () => {
  const [
    {
      userData: { id: userId },
    },
  ] = useContext(GlobalContext)
  const [data, setData] = useState([])
  const getData = async () => {
    if (userId) {
      console.log(userId)
      const userTopTracks = await getUserPartyPlaylists(userId)
      console.log(userTopTracks)
      setData(userTopTracks)
    }
  }

  useEffect(() => {
    getData()
  }, [getData, userId])

  return {
    userTopTracks: data,
  }
}

const Scratch = () => {
  return <PlaylistRemover />
  // return (
  //   <>
  //     <h1>Scratch</h1>
  //     <code style={{ fontSize: 8 }}>
  //       <pre>{JSON.stringify(userTopTracks, null, 2)}</pre>
  //     </code>
  //   </>
  // )
}

export default Scratch
