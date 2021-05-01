const cors = require("micro-cors")();
import { createNewTopTablePlaylist } from "../../db/models/topTablePlaylists.model";

module.exports = cors(async function (req, res) {
  try {
    if (req.method === "OPTIONS") {
      res.status(200);
      res.send();
      return;
    }

    let playlist = await createNewTopTablePlaylist(
      req.query.spotify_user_id,
      req.body
    );

    res.status(200).json(playlist);
  } catch (error) {
    console.log("api/playlists/create.tsv", error);

    res.status(400).send(error);
  }
});
