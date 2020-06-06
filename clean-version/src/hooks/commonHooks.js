import { useState, useCallback } from 'react'

export const useToggle = intialValue => {
  const [ value, setValue ] = useState( intialValue )

  const toggler = useCallback( () => {
    setValue(!value) 
  })

  return [ value, toggler ]
}

export const useHandleChange = (inialState) => {
	const [ formState, setFormState ] = useState(inialState)
	
	const handleChange = ({ target }) => {
		let { name, value, checked, type } = target
		if (type === 'checkbox') value = checked

		setFormState({ ...formState, [name]: value }) 
	}

	return [ formState, handleChange, setFormState ]
};

export function useFlash (className, timeout=1000) {
  const [value, setClass] = useState("")

  const flashClassname = () => {
    setClass(className)
    setTimeout(() => setClass(""), timeout)
  }
  return [value, flashClassname]
}

export default {
  useToggle,
  useHandleChange,
  useFlash,
}