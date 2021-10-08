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

export const partyblendsPermissions = [
  'user-top-read',
  'playlist-modify-private',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-read-collaborative',

  'user-modify-playback-state',
  // 'user-read-email',
  'user-read-private',
  'user-read-currently-playing',
  'app-remote-control',
].join(' ')

module.exports = {
  allPermisions,
  topTablePermissions,
  partyblendsPermissions,
}
