const cors = require("micro-cors")();
import { createNewTopTablePlaylist } from "../../db/models/topTablePlaylists.model";

module.exports = cors(async function (req, res) {
  try {
    if (req.method === "OPTIONS") {
      res.status(200);
      res.send();
      return;
    }
    const time_range = req.query.time_range ? `-${req.query.time_range}` : "";

    let playlist = await createNewTopTablePlaylist(
      `${req.query.spotify_user_id}${time_range}`,
      req.body
    );

    res.status(200).json(playlist);
  } catch (error) {
    console.log("api/playlists/create.tsv", error);

    res.status(400).send(error);
  }
});
