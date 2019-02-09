import React, { useState, useCallback } from 'react'
import SelectContainer from './SelectContainer';
import { searchSpotify, getPlaylistsTracks } from '../api/spotify'

const options = [
  'label', 'artist', 'album', 'track', 'year', 'playlist'
]

const types =  [
  'artist', 'album', 'track', 'playlist'
]

const SearchSpotify = () => {
  let [searchObj, setInput] = useState(() => {
    let obj = {}
    options.map( o => obj[o] = null )
    return obj
  })
  let [type, setType] = useState(null)
  let [searchTerm, setTerm] = useState(null)

  // let [values, setValues]= useState([])

  const getTracks = useCallback( async() => {
    // let queryObj = searchObj.keys.filter(Boolean)
    let data = await searchSpotify( searchObj, type )

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
      <table onChange={({ target }) => handleChange(target)} >
      
        <tr >
          <td> search </td>
          <td>
            <input
              onChange={({ target }) => setTerm(target.value)}
              type="text"
              name='searchTerm'
              value={searchTerm}
            />
          </td>
        </tr>
      {
        options.map( option =>  
          <tr >
            <td>
            {types.includes(option) && 
              <input
                type="checkbox"
                name={option}
                checked={type === option }
              />
            }
            </td>
            <td> { option }</td>
            <td>
              <input
                type="text"
                name={option}
                value={searchObj[option]}
              />
            </td>
          </tr>
      )}
      </table>

      <input onClick={getTracks} type="submit"/>
        <span>{ JSON.stringify(searchObj) }</span>
        <span>{ type }</span>

    </div>
  )
}

export default SearchSpotify