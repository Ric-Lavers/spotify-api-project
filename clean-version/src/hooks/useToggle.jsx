import { useState, useCallback } from 'react'

const useToggle = intialValue => {
  const [ value, setValue ] = useState( intialValue )

  const toggler = useCallback( () => {
    setValue(!value) 
  })

  return [ value, toggler ]
}

export default useToggle;