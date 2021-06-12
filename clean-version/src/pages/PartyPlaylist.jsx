import React, { memo, useContext, useState, useEffect } from 'react'
import { useSetState } from 'react-use'
import Slide from 'react-reveal/Slide'
import makeCarousel from 'react-reveal/makeCarousel'
import truncate from 'lodash.truncate'
import get from 'lodash.get'
import { useParams } from 'react-router-dom'

import Range from 'components/common/RangeSlider'
import { useToggle, withCurrentSong } from 'hooks'
import {
  PlaylistTable,
  SavePlaylist,
  CurrentPlaylist,
  UserPlaylistsSelect,
} from '../components/AnalysisPlaylists'
import {} from 'api/spotify'
import { GlobalContext } from 'globalContext'
import { combineArtists } from 'helpers'
import { specialPlaylists, savedTracks } from 'constants/index'
import { getUserPartyPlaylists, getPartyPlaylist } from 'api/party-playlist'
import { stats as _stats } from '../components/stats/Stats'
import {
  useTopTracks,
  getTopTrackIds,
  createTopTracksPlaylist,
  formatUserPlaylists,
} from './PartyPlaylist.utils'

const favPlaylists = [...specialPlaylists, savedTracks]

const Dev = ({ data }) => (
  <>
    <code style={{ fontSize: 9 }}>
      <pre>{JSON.stringify(data, null, 1)}</pre>
    </code>
  </>
)

const PartyPlaylist = React.memo(() => {
  const [
    {
      userData: { id: userId },
    },
  ] = useContext(GlobalContext)
  const { playlistId } = useParams()
  const { topTracks, loading } = useTopTracks(userId)
  const [playlists, setPlaylists] = useState([])

  const createPartyPlaylist = async ({
    name: title,
    description,
    isPublic,
    collaborative,
  }) => {
    const data = await createTopTracksPlaylist(
      userId,
      { title, description, isPublic, collaborative },
      getTopTrackIds(formatUserPlaylists(topTracks))
    )
    return data
  }

  useEffect(() => {
    if (userId) {
      getUserPartyPlaylists(userId).then((playlists) => {
        setPlaylists(formatUserPlaylists(playlists))
      })
    }
  }, [userId])
  const handleChangePlaylist = (partyPlaylistId) => {
    window.location.replace(`/party-playlist/${partyPlaylistId}`)
  }

  if (!userId || loading) {
    return <div>loading...</div>
  }

  if (!playlistId) {
    return (
      <>
        <div className="analysis-playlists">
          <SavePlaylist user_id={userId} createPlaylist={createPartyPlaylist} />
        </div>
        {playlists.length !== 0 && (
          <div className="analysis-playlists">
            <UserPlaylistsSelect
              label={'select your party playlist'}
              onChange={handleChangePlaylist}
              playlists={playlists}
              currentPlaylistId={playlistId}
            />
          </div>
        )}
      </>
    )
  }

  return <PartyPlaylistGroup playlistId={playlistId} topTracks={topTracks} />
})

const PartyPlaylistGroup = ({ topTracks, playlistId }) => {
  const [data, setData] = useSetState({ playlistTracks: [], loading: false })

  useEffect(() => {
    setData({ loading: true })
    getPartyPlaylist(playlistId)
      .then((d) => setData({ playlistTracks: d }))
      .finally(setData({ loading: false }))
  }, [playlistId])

  return (
    <div className="analysis-playlists">
      <Dev data={data} />
    </div>
  )
}

export default PartyPlaylist
