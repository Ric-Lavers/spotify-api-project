import React, { useContext } from 'react'
import Flip from 'react-reveal/Flip'
import { transferDevice } from '../../api/spotify'
import { GlobalContext } from '../../globalContext'

export default function Devices() {
  const [{ devices, visible }, , { fetchDevices }] = useContext(GlobalContext)

  const handleDeviceClick = async (id) => {
    await transferDevice(id)
    await fetchDevices()
  }
  return (
    <Flip /* big */ bottom when={visible.devices}>
      <div
        className="player devices"
        style={visible.devices ? {} : { display: 'none' }}
      >
        <ul>
          {devices.map(({ id, is_active, type, name }) => (
            <li
              key={id}
              className={`pointer ${is_active ? 'green' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                handleDeviceClick(id)
              }}
            >
              {name} ({type})
            </li>
          ))}
        </ul>
      </div>
    </Flip>
  )
}
