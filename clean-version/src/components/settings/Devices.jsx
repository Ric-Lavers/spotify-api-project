import React, { useContext } from 'react'
import Slide from 'react-reveal/Slide'
import Flip from 'react-reveal/Flip'
import { GlobalContext } from '../../globalContext'

export default function Devices() {
	const { devices, visible } = useContext(GlobalContext)[0]

	return (
		<Flip /* big */bottom when={visible.devices}>
		
		<div className='player devices' style={visible.devices?{}:{display: 'none' } }>
			<ul>
				{devices.map( ({ id, is_active, type, name }) => (
					<li
						key={id}
						className={`${is_active ? 'green' : ''}`}
					>
						{name} ({type})
					</li>
				))}
			</ul>
		</div>

    </Flip>
	)
}
