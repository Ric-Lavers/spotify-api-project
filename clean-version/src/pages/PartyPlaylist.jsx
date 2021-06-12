import React, { memo, useContext, useState, useEffect, useMemo } from 'react'
import Slide from 'react-reveal/Slide'
import makeCarousel from 'react-reveal/makeCarousel'
import truncate from 'lodash.truncate'
import get from 'lodash.get'
import { useParams } from 'react-router-dom'

import Range from 'components/common/RangeSlider'
import { withCurrentSong } from '../hooks'
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
  addTopTracksToPlaylist,
} from './PartyPlaylist.utils'

const favPlaylists = [...specialPlaylists, savedTracks]

const Dev = ({ data }) => (
  <>
    <code style={{ fontSize: 9 }}>
      <pre>{JSON.stringify(data, null, 1)}</pre>
    </code>
  </>
)

const PartyPlaylist = React.memo(
  withCurrentSong(({ currentSong }) => {
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
        getTopTrackIds(topTracks)
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

    if (playlistId) {
      return (
        <PartyPlaylistGroup
          playlistId={playlistId}
          currentPlayingId={currentSong ? currentSong.item.id : ''}
          spotify_user_id={userId}
          topTrackIds={getTopTrackIds(topTracks)}
        />
      )
    }
    if (!userId || loading) {
      return <div>loading...</div>
    }

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
  })
)

const PartyPlaylistGroup = memo(
  ({ playlistId, currentPlayingId, spotify_user_id, topTrackIds }) => {
    console.log({ topTrackIds })
    const [{ playlist, loading }, setData] = useState({
      playlist: [],
      loading: true,
    })

    useEffect(() => {
      setData((s) => ({ ...s, loading: true }))
      getPartyPlaylist(playlistId).then((d) =>
        setData({ playlist: d, loading: false })
      )
    }, [playlistId])

    const handleAddToPartyPlaylist = async () => {
      await addTopTracksToPlaylist(spotify_user_id, playlistId, topTrackIds)
    }

    console.log({ currentPlayingId, playlist })

    return (
      <div className="analysis-playlists">
        <button onClick={handleAddToPartyPlaylist}> add ya tracks</button>
        <PlaylistTable
          loading={loading}
          tracks={playlist.tracks}
          currentTrackId={currentPlayingId}
          uris={playlist.uris || []}
          stats={['score']}
          onAllCheck={(checked) => {}}
          onCheckTrack={(id, checked) => {}}
          onSort={({ target: { value } }) => {}}
          currentSortValue={'title'}
        />
      </div>
    )
  }
)

export default PartyPlaylist
