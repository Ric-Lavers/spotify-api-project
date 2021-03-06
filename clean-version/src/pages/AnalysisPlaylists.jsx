import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Playlists, {
  usePlaylistSongs,
  PlaylistSongs
} from "../components/playlists/Playlists";
import { getAllPlaylistsTracks, getManyAudioFeatures } from "api/spotify";
import { stats } from "components/stats/Stats";

import { GlobalContext } from "globalContext";

const useSongsWithAudioFeatures = songs => {
  const [songWithFeatures, setSongWithFeatures] = useState(songs);

  useEffect(() => {
    if (songs.length) {
      // console.log(songs.map(({ track }) => track.id));
      // getManyAudioFeatures(songs.map(({ track }) => track.id));
    }
  }, [songs]);
};

const AnalysisPlaylistsPage = () => {
  const [
    {
      currentPlaying: { details: currentPlaying }
    }
  ] = useContext(GlobalContext);
  const { playlistId } = useParams();

  useEffect(async () => {
    const data = await getAllPlaylistsTracks(playlistId);
    console.log({ data });
  }, [playlistId]);

  // const { songs } = usePlaylistSongs(playlistId, true);

  // console.log(songs);
  return (
    <>
      <PlaylistSongs
        playlistId={playlistId}
        currentlyPlayingId={currentPlaying.id}
        context_uri={null}
      />
    </>
  );
};

export default AnalysisPlaylistsPage;
