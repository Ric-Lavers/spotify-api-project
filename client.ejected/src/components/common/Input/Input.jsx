import React from 'react'

const Input = ({ label, type = 'text', ...props }) => {
  return (
    <label className="s-input">
      <span>{label}</span>
      {type === 'textarea' ? (
        <textarea {...props} />
      ) : (
        <input type={type} {...props} />
      )}
    </label>
  )
}

export default Input
