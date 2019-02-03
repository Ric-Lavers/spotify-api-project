import { useState, useCallback } from 'react'

const useToggle = intialValue => {
  const [ toggleValue, setToggleValue ] = useState( intialValue )
  const toggler = useCallback( () => setToggleValue(!toggleValue) )
  
  return [ toggleValue, toggler ]
}

export default useToggle;