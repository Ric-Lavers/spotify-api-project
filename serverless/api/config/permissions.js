const allPermisions = [
  'streaming',
  'user-follow-modify',
  'user-modify-playback-state',
  'user-read-private',
  'user-read-birthdate',
  'user-library-read',
  'app-remote-control',
  'user-follow-read',
  'user-top-read',
  'user-read-email',
  'playlist-modify-private',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'user-read-playback-state',
  'user-read-recently-played',
  'user-read-currently-playing',
  'user-library-modify',
].join(' ')
const topTablePermissions = ['user-top-read', 'user-read-email']
const partyPlaylistPermissions = [
  'user-top-read',
  'playlist-modify-private',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-read-collaborative',

  'user-read-email',
  'user-read-currently-playing',
]

module.exports = {
  allPermisions,
  topTablePermissions,
}
