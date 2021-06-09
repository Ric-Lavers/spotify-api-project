import { connectToDatabase } from "../connectToDB";
import { TrackObjectFull } from "../../types/spotify-api";

export const getTopTablePlaylistById = async (topTablePlaylistId: string) => {
  const { TopTracksPlaylist } = connectToDatabase();
  let list = await TopTracksPlaylist.findById(topTablePlaylistId).sort("score");

  console.log(list);

  return list;
};

export const getTopTablePlaylistsByUserIds = async (
  spotify_user_id: string
) => {
  const { TopTracksPlaylist } = connectToDatabase();

  let usersLists = await TopTracksPlaylist.find({
    user_ids: {
      $in: spotify_user_id,
    },
  });

  return usersLists;
};

/**
 * This are just playlists that are created using top track data.
 */
export const createNewTopTablePlaylist = async (userId: string, body) => {
  const { TopTracksPlaylist } = connectToDatabase();

  const tracks: TrackObjectFull[] = body.tracks;
  // create top table instance
  const newTopTablePlaylist = new TopTracksPlaylist({
    user_ids: [userId],
    ...body,
    tracks: tracks.map((spotify_id, rank) => ({
      _id: spotify_id,
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
  trackIds: TrackObjectFull[]
) => {
  const list = await getTopTablePlaylistById(topTablePlaylistId);

  if (list.user_ids.some((u) => u === userId)) return list;

  list.user_ids.push(userId);
  trackIds
    .map((spotify_id) => ({
      _id: spotify_id,
    }))
    .forEach((t, rank) => {
      const exists = list.tracks.find((track) => track._id === t._id);
      if (exists) {
        exists.count = exists.count + 1;
        exists.rank.push(rank + 1);
        exists.score =
          Math.round(
            (exists.rank.reduce((a, c) => a + c, 0) / exists.count) * 1000
          ) / 1000;

        exists.user_ids.push(userId);
      } else list.tracks.push({ ...t, user_ids: [userId] });
    });
  await list.save();

  const result = await getTopTablePlaylistById(topTablePlaylistId);
  return result;
};
