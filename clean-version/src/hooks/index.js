import { useState, useCallback } from 'react'

const useToggle = intialValue => {
  const [ value, setValue ] = useState( intialValue )

  const toggler = useCallback( () => {
    setValue(!value) 
  })

  return [ value, toggler ]
}

const handleFormChange = (inialState) => {
	const [ formState, setFormState ] = useState(inialState)
	
	const handleChange = ({ target }) => {
		let { name, value, checked, type } = target
		if (type === 'checkbox') value = checked

		setFormState({ ...formState, [name]: value }) 
	}
	
	return [ formState, handleChange ]
}



export {
	useToggle,
	handleFormChange,
}