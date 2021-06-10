import { connectToDatabase } from "../connectToDB";
import { TrackObjectFull } from "../../types/spotify-api";

export const getTopTablePlaylistById = async (topTablePlaylistId: string) => {
  const { TopTracksPlaylist } = connectToDatabase();
  let data;
  await TopTracksPlaylist.findById(topTablePlaylistId).then((playlist) => {
    playlist.tracks.sort((a, b) => a.score - b.score);

    data = playlist;
  });

  return data;
};

export const getTopTablePlaylistsByUserIds = async (
  spotify_user_id: string
) => {
  const { TopTracksPlaylist } = connectToDatabase();

  let usersLists = await TopTracksPlaylist.find({
    user_ids: {
      $in: spotify_user_id,
    },
  }).select(["_id", "description", "title", "created_at", "user_ids"]);

  return usersLists;
};

/**
 * This are just playlists that are created using top track data.
 */
export const createNewTopTablePlaylist = async (userId: string, body) => {
  const { TopTracksPlaylist } = connectToDatabase();
  //TODO
  const actualUserId = userId
    .replace("-short_term", "")
    .replace("-medium_term", "")
    .replace("-long_term", "");
  console.log(actualUserId, userId);

  const tracks: TrackObjectFull[] = body.tracks;
  // create top table instance
  const newTopTablePlaylist = new TopTracksPlaylist({
    user_ids: [actualUserId],
    ...body,
    tracks: tracks.map((spotify_id, rank) => ({
      id: spotify_id,
      rank: [rank + 1],
      score: rank + 1,
      user_ids: [userId],
    })),
  });

  const result = await newTopTablePlaylist.save();

  return result;
};

export const addTracksToTopTablePlaylist = async (
  topTablePlaylistId,
  userId: string,
  trackIds: string[]
) => {
  //TODO
  const actualUserId = userId
    .replace("-short_term", "")
    .replace("-medium_term", "")
    .replace("-long_term", "");
  const list = await getTopTablePlaylistById(topTablePlaylistId);

  if (list.user_ids.some((u) => u === userId)) return list;

  if (!list.user_ids.some((id) => id === actualUserId)) {
    list.user_ids.push(actualUserId);
  }
  trackIds
    .map((spotify_id, rank) => ({
      id: spotify_id,
      rank: [rank + 1],
      score: rank + 1,
      user_ids: [userId],
    }))
    .forEach((t, rank) => {
      const exists = list.tracks.find((track) => track.id === t.id);
      if (exists) {
        exists.count = exists.count + 1;
        exists.rank.push(rank + 1);
        exists.score =
          Math.round(
            (exists.rank.reduce((a, c) => a + c, 0) / exists.count) * 1000
          ) / 1000;

        exists.user_ids.push(userId);
      } else {
        list.tracks.push(t);
      }
    });
  await list.save();

  const result = await getTopTablePlaylistById(topTablePlaylistId);
  return result;
};
