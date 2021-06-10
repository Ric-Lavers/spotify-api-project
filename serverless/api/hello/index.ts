const cors = require("micro-cors")();
require("dotenv").config();
import { getMongoUri } from "../../db/getMongoUri";

module.exports = cors(function (req, res) {
  res.status(200).json({
    message: "hello",
    NODE_ENV: process.env.NODE_ENV,
  });
});
