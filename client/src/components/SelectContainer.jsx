
import React from 'react'
import Select from 'react-select'

const SelectContainer = (props, {options, value, onChange}) => {
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
          options={options}
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