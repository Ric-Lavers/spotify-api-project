const objectFields = ['a', 'b', 'c']

const extractFieldsFromObject = ( releases, fields=[] ) => {

  const validFields = fields.filter( f => {
    if ( objectFields.includes(f)) {
      return true
    }
    else {
      console.warn(`${f} is not an avaiable field`)
      return false
    }
  })
  
  return releases.map( track => {
    return validFields.reduce((a,c) => {
      return({...a, [c]: track[c] })
    }, {}
    ) 
  })
}
