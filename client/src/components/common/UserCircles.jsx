import React, { memo } from 'react'
import get from 'lodash.get'
import { timeSince, mix } from 'helpers'

const UserCircles = memo(({ users, size }) => (
  <div className="user-circles">
    {(users || []).map((user) => (
      <UserCircle user={user} size={size} />
    ))}
  </div>
))
export const UserCircle = ({ user, size = '' }) => {
  const imageUrl = get(user, 'images[0].url', null)
  const displayName = get(user, 'display_name', null)

  let updatedAt = new Date(user.updated_at)
  const aMonthAgo = (() => {
    updatedAt.setMonth((updatedAt.getMonth() - 1) % 11)
    return updatedAt
  })()
  updatedAt = new Date(user.updated_at)

  // percent of a month
  const percentOfaMonth =
    (1 - (new Date() - updatedAt) / (new Date() - aMonthAgo)) * 100

  return (
    <div className={`user-circle tooltip`}>
      {displayName && (
        <div class="tooltiptext">
          <span>{displayName} </span>
          <br />
          <small> last updated {timeSince(user.updated_at)} ago</small>
        </div>
      )}
      {imageUrl ? (
        <img className={`user-circle__img ${size}`} alt="user" src={imageUrl} />
      ) : (
        <div
          className={`user-circle__txt ${size}`}
          style={{
            backgroundColor: mix('1db954', 'ff0000', percentOfaMonth),
          }}
        >
          {displayName[0].toUpperCase()}
        </div>
      )}
    </div>
  )
}
export default UserCircles
