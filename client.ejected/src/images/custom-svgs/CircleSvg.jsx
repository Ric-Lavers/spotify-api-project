import React from 'react'

const CircleSvg = ({ offset, style, ...props }) => 
	<svg
		style={style}
		id="circle-offset"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		{...props}
	>
		<circle 
			cx="12" cy="12" r="8"
		/>
		{offset && 
		<text x={8 - ((offset.toString().length -1) * 4 -1)} y="16" style={{ fontSize: 12, textAlign: 'center' }} >
		 {offset}
		</text>}
		{/* offset && 
		<text x="8" y="16" style={{ fontSize: 12 }} >
		 {offset}
		</text> */}
	</svg>

export default CircleSvg
