import React from "react";

import PopularityMeter from "images/custom-svgs/PopularityMeter";
import { millisToMinutesAndSeconds } from "./millisToMinutesAndSeconds";
import { combineArtists } from "helpers";

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function formatFeatures(key, audio_features) {
  switch (key) {
    case "key":
      return keys[audio_features[key]];
    case "mode":
      return audio_features[key] === 1 ? "Major" : "Minor";
    case "tempo":
      return `${Math.round(audio_features[key])}bpm`;
    case "artists":
      return combineArtists(audio_features[key]);
    case "duration_ms":
      return millisToMinutesAndSeconds(audio_features[key]);
    case "popularity":
      return <PopularityMeter popularity={audio_features[key]} />;
    default:
      return audio_features[key];
  }
}
