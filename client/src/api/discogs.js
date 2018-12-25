//@flow
const TOKEN = process.env.REACT_APP_DISCOGS_TOKEN

export const searchDiscogs = async(queryObj) => {
  const query = new URLSearchParams({...queryObj, token: TOKEN}).toString()
  try {
    let res= await fetch(`https://api.discogs.com/database/search?${query}`)
    return res.json()
  } catch (error) {
    console.log(error.message)
    return error
  }
}

export const labelReleases = async(labelId, queryObj: labelReleasesQueryObj ) => {
    const query = new URLSearchParams({ ...queryObj }).toString()
    try {
      let res= await fetch(`https://api.discogs.com/labels/${labelId}/releases?${query}`)
      return res.json()
    } catch (error) {
      console.log(error.message)
      return error
    }
  }

  
type labelReleasesQueryObj = {
  page: number,
  per_page: number,
}

type labelReleasesResponse = {
  pagination: {
    per_page: number,
    pages: number,
    page: number,
    urls: {
      last: string,
      next: string
    },
    items: number
  },
  releases: Array<release>
}

type release = {
  artist: string,
  catno: string,
  format: string,
  id: number,
  resource_url: string,
  status: string,
  thumb: string,
  title: string,
  year: number
}