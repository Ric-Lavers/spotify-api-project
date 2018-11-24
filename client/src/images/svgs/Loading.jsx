import React from 'react'
import '../../styles/svgs.css'
import './Loading.css'

const LoadingSvg = ({variation}) =>
  <svg
    xmlns = "http://www.w3.org/2000/svg"
    viewBox = "0 0 1000 40" 
    width="100%"
    // style={{ strokeWidth: 5 }}
    className="loading"
  >
    <line
      id="lineLeft"
      style={{stroke: '#1CB953'}}
      x1="0" y1="5" x2="500" y2="5"  
    />
    <line
      id="lineRight"
      style= {{stroke: '#1CB953'}}
      x1="500" y1="5" x2="1000" y2="5"  
    />
    <animate 
      id="aniLineRight"
      href="#lineRight"
      attributeName="x2"
      from="500"
      to="1000" 
      dur="1s"
      fill="freeze" 
      begin="0s; aniLineRight_2.end"
      // repeatCount="indefinite"
      />
    <animate 
      id="aniLineLeft"
      href="#lineLeft"
      attributeName="x1"
      from="500"
      to="0" 
      dur="1s"
      fill="freeze" 
      // repeatCount="indefinite"
      begin="0; aniLineLeft_2.end"
      />
    <animate
      id="aniLineRight_2"
      href="#lineRight"
      attributeName="x2"
      from="1000" 
      to="500"
      dur="1s"
      fill="freeze" 
      // repeatCount="indefinite"
      begin="aniLineRight.end"
      />
    <animate
      id="aniLineLeft_2"
      href="#lineLeft"
      attributeName="x1"
      from="0"
      to="500" 
      dur="1s"
      fill="freeze" 
      // repeatCount="indefinite"
      begin="aniLineLeft.end"
      />
    <animate
      href="#lineLeft"
      attributeName="stroke-width"
      dur="5s"
      fill="freeze" 
      repeatCount="indefinite"
      values="4;9;4"
      />
    <animate
      href="#lineRight"
      attributeName="stroke-width"
      dur="5s"
      fill="freeze" 
      repeatCount="indefinite"
      values="4;9;4"
      />
  </svg>

LoadingSvg.defaultProp = {
  variation: 0.5
}

export default LoadingSvg