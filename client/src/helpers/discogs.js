//@flow
import warning from 'tiny-warning';
/* 
  *
  * takes releases the Discogs label ID search 
  * and reduces to the specificed fields 
*/
const objectFields = [
  'thumb',
  'title',
  'user_data',
  'master_url',
  'uri',
  'cover_image',
  'resource_url',
  'master_id',
  'type',
  'id',
]

const extractFieldsFromLabels = ( releases: Array<labelReleasesDiscogs>, fields=[] ) => {

  const validFields = fields.filter( f => {
    if ( objectFields.includes(f)) {
      return true
    }
    else {
      console.warn(`${f} is not an avaiable field`)
      return false
    }
  })
  
  return releases.map( track => validFields.reduce((a,c) => ({...a, [c]:arr[1][c] }), {}) )
}

type labelReleasesDiscogs = {
  thumb: string,
  title: string,
  user_data: object,
  master_url: object,
  uri: string,
  cover_image: string,
  resource_url: string,
  master_id: object,
  type: string,
  id: number,
}