import React from 'react'
import {  ReactComponent as Tick } from '../../images/custom-svgs/tick.svg'
import {  ReactComponent as Cross } from '../../images/custom-svgs/cross.svg'
import {  ReactComponent as Plus } from '../../images/custom-svgs/plus.svg'




const SfCheck = ({checked, onClick}) => 
	<div className="sfCheck" onClick={onClick} >
		{checked ?
			<>
				<Tick className='icon sfCheck_tick ' />
				<Cross className='icon sfCheck_cross' />
			</> :
			<Plus className='icon sfCheck_plus' />
		}
		
		
	</div>

export default SfCheck