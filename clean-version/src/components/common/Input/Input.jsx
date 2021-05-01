import React from 'react'

const Input = ({ type = 'text', ...props }) => {
  return <input className="s-input" type={type} {...props} />
}

export default Input
