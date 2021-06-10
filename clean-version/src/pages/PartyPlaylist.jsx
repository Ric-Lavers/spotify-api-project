import React, { memo, useContext, useState, useEffect } from 'react'
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
import {
  getAllPlaylistsTracks,
  getMePlaylists,
  getHeapsAudioFeatures,
  play,
  createUserPlaylistWithTracks,
  getHeapsTracks,
} from 'api/spotify'
import { GlobalContext } from 'globalContext'
import PopularityMeter from 'images/custom-svgs/PopularityMeter'
import { combineArtists } from 'helpers'
import { specialPlaylists, savedTracks } from 'constants/index'
import { getUserPartyPlaylists } from 'api/party-playlist'
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

  return (
    <>
      <Dev data={topTracks} />
    </>
  )

  // return (
  //   <>
  //

  //     <div className="analysis-playlists">
  //       <UserPlaylistsSelect
  //         label={'select your party playlist'}
  //         onChange={handleChangePlaylist}
  //         playlists={playlistList}
  //         currentPlaylistId={playlistId}
  //       />
  //     </div>
  //     <div className="analysis-playlists">
  //       <BlackStatList hide={isHidden} />
  //       <button onClick={toggleHidden}>table settings (audio features)</button>
  //     </div>
  //     <div className="analysis-playlists">
  //       <PlaylistTable
  //         tracks={[]}
  //         // currentTrackId={currentTrackId}
  //         uris={uris}
  //         stats={stats}
  //         onAllCheck={() => void {}}
  //         onCheckTrack={() => void {}}
  //         currentSortValue={''}
  //       />
  //     </div>
  //   </>
  // )
})

export default PartyPlaylist