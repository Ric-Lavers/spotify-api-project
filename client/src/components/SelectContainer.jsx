
import React from 'react'
import Select from 'react-select'

import {trackKeys} from '../App'

const SelectContainer = (props, {value, onChange}) => {
  return (
    <div className="SelectContainer" >
      <Select 
          className="react-select-container"
          classNamePrefix="react-select"
          isMulti 
          placeholder='filters'
          // value={value}
          // onChange={onChange}
          // value={this.state.filters}
          // onChange={(data)=> this.setState({filters: data})}
          options={
            trackKeys.map( key => ({value: key, label: key}) )
          }
          {...props}
      />
    </div>
  )
}
export const reactSelectStyles = [
  'clearIndicator',
  'container',
  'control',
  'dropdownIndicator',
  'group',
  'groupHeading',
  'indicatorsContainer',
  'indicatorSeparator',
  'input',
  'loadingIndicator',
  'loadingMessage',
  'menu',
  'menuList',
  'menuPortal',
  'multiValue',
  'multiValueLabel',
  'multiValueRemove',
  'noOptionsMessage',
  'option',
  'placeholder',
  'singleValue',
  'valueContainer',
]

export default SelectContainer