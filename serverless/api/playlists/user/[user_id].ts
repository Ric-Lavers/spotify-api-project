const cors = require("micro-cors")();

import { getTopTablePlaylistsByUserIds } from "../../../db/models/topTablePlaylists.model";

module.exports = cors(async function (req, res) {
  try {
    let playlists = await getTopTablePlaylistsByUserIds(req.query["user_id"]);

    res.status(200).json(playlists);
  } catch (error) {
    console.log("api/playlists/[top-table-playlist-id]/[user_id].ts", error);

    res.status(400).send(error);
  }
});
