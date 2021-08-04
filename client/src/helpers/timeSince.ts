import humanize from 'tiny-human-time'

export function timeSince(time: Date) {
  return humanize(Date.now(), new Date(time))
}
