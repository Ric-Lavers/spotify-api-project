import React, { memo } from 'react'
import Skeleton from 'react-loading-skeleton'
import get from 'lodash.get'
import { timeSince, mix } from 'helpers'

const UserCircles = memo(({ users, size, loading = false, children }) => {
  if (loading) {
    return (
      <Skeleton
        circle
        width={size === 'small' ? 30 : 40}
        height={size === 'small' ? 30 : 40}
      />
    )
  }
  if (size === 'small' && users.length > 4) {
    const len = users.length
    const otherUsers = users.splice(4, len)
    users.push({
      updated_at: new Date(),
      display_name: `+ ${len - 4}`,
      isInfo: true,
      otherUsers,
    })
  }
  return (
    <div className={`user-circles ${size}`}>
      {(users || []).map((user) => (
        <UserCircle
          user={user}
          size={size}
          isInfo={user.isInfo}
          otherUsers={user.otherUsers}
        />
      ))}
      {children}
    </div>
  )
})
export const UserCircle = ({
  user,
  size = '',
  isInfo = false,
  otherUsers = [],
}) => {
  const [timeSinceUpdate, setTimeSinceUpdate] = React.useState(
    timeSince(user.updated_at)
  )
  const imageUrl = get(user, 'images[0].url', null)
  const displayName = get(user, 'display_name', null)

  let updatedAt = new Date(user.updated_at)
  const aMonthAgo = (() => {
    updatedAt.setMonth((updatedAt.getMonth() - 1) % 11)
    return updatedAt
  })()
  updatedAt = new Date(user.updated_at)

  const handleTimeSinceUpdate = () => {
    setTimeSinceUpdate(timeSince(user.updated_at))
  }

  // percent of a month
  const percentOfaMonth =
    (1 - (new Date() - updatedAt) / (new Date() - aMonthAgo)) * 100

  if (isInfo) {
    return (
      <div className={`user-circle tooltip`} /* style={{ zIndex: 3 }} */>
        <div class="tooltiptext">
          <small>
            {otherUsers.map(({ display_name }) => display_name).join(', ')}{' '}
          </small>
        </div>
        <div className={`user-circle__txt ${size} info`}>
          <span>{displayName}</span>
        </div>
      </div>
    )
  }

  return (
    <div onMouseEnter={handleTimeSinceUpdate} className={`user-circle tooltip`}>
      {displayName && (
        <div class="tooltiptext">
          <span>{displayName} </span>
          <br />
          <small> last updated {timeSinceUpdate} ago</small>
        </div>
      )}
      {imageUrl ? (
        <img
          className={`user-circle__img ${size}`}
          alt="user"
          src={imageUrl}
          style={{
            boxShadow: `2px 2px 2px ${mix(
              '1db954',
              'ff0000',
              percentOfaMonth
            )}`,
          }}
        />
      ) : (
        <div
          className={`user-circle__txt ${size}`}
          style={{
            backgroundColor: mix('1db954', 'ff0000', percentOfaMonth),
          }}
        >
          <span>{displayName[0].toUpperCase()}</span>
        </div>
      )}
    </div>
  )
}

export default UserCircles
