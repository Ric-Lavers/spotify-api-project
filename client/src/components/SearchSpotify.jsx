import React, { useState, useCallback } from 'react'
import SelectContainer from './SelectContainer';
import { searchSpotify, getPlaylistsTracks } from '../api/spotify'

const options = [
  'label', 'artist', 'album', 'track', 'year', 'playlist'
]

const SearchSpotify = () => {
  let [searchObj, setInput] = useState(() => {
    let obj = {}
    options.map( o => obj[o] = null )
    return obj
  })
  let [type, setType] = useState(null)

  // let [values, setValues]= useState([])

  const getTracks = useCallback( async() => {
    let query = searchObj.filter(Boolean)
    // let data = await searchSpotify(`label:${input}`, values.map(i => i.value).join(','), )

  }, [setInput] )

  const handleChange =  ( { name, value, checked } ) => {
    
    if ( checked ) {
      setType( name )
      return
    }

    setInput( {...searchObj, [name]: value} )
  }
   

  return (
    <div>
      <h2>Search spotify</h2>
      <h3>search by</h3>
      {/* <SelectContainer
        placeholder={"apply filters"}
        className="react-select-container"
        classNamePrefix="react-select"
        isMulti 
        value={values}
        onChange={option => {
          console.log(option)
          setValues(option)
        }}
        options={options.map( o => ({value: o, label: o}) )}
      /> */}
      <form onChange={({ target }) => handleChange(target)} style={{ padding: '0 25%' }} >
      {
        options.map( option =>  
          <label style={{ color: 'white', padding: 7,  display: 'flex', justifyContent: 'space-between' }} >
            <input type="checkbox" name={option} checked={type === option } />
            <div> { option }</div>
            <input
              
              type="text"
              name={option}
              value={searchObj[option]}
            />
          </label>
      )}
      </form>

      <input onClick={getTracks} type="submit"/>
        <span>{ JSON.stringify(searchObj) }</span>
        <span>{ type }</span>

    </div>
  )
}

export default SearchSpotify