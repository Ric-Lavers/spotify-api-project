import { play } from "api/spotify"

export const handlePlay = (type, uri) => {
  let body = {}
  if (type === "tracks") {
    body = { uris: [uri] }
  } else if (type === "albums") {
    body = { context_uri: uri }
  } else {
    body = { context_uri: uri }
  }
  play(body)
}
