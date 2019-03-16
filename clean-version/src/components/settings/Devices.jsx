import React, { useContext } from 'react'
import Slide from 'react-reveal/Slide'
import Fade from 'react-reveal/Fade';
import { GlobalContext } from '../../globalContext'

export default function Devices() {
	const { devices, visible } = useContext(GlobalContext)[0]

	return (
		<Fade big when={visible.devices}>
    <Slide duration={1000} top when={visible.devices}>
		<div className='player devices'>
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
		</Slide>
    </Fade>
	)
}
