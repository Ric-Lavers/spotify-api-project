import React, { useContext } from 'react'

import { SearchResultsContext } from './Search'
import { SpotifyHelpers } from '../../helpers'
import { ReactComponent as ArrowDown} from '../../images/custom-svgs/arrow-down.svg'
import PopularityMeter from '../../images/custom-svgs/PopularityMeter'
import Pagination from '../common/Pagination'
import { play, getHref, getFollowingState, follow, unFollow, getAlbums } from '../../api/spotify'
import { types } from './Search'

const findType = data => {
	const [type] = types.map( t => t + "s" ).filter( t => data[t] )
	return type
}

// you can only check the status of 100 artist at a time
const addFollowingStatus = async(data) => {
	let itemObject = {}
	let { items } =  data['artists']
	let itemsIds = items
		.filter(({ following }) => following === undefined)
		.map(({ id }) => id )

	let statusArray = await getFollowingState(itemsIds, 'artist')
	itemsIds.forEach( (id, i) => {
		itemObject[id] =  statusArray[i]
	})

	if (!statusArray || !statusArray.length) {
		return data
	}

	const itemsWithStatus = items.map( (item, i) => ({
		following: item.following ? item.following : itemObject[item.id],
		...item,
	}) )

	return ({artists: { ...data['artists'], items: itemsWithStatus }})
}

const addLabelToAlbum = async(data) => {
	let itemObject = {}
	let { items } =  data['albums']
	let itemsIds = items
		.filter(({ label }) => label === undefined)
		.map(({ id }) => id )

	let {albums: albumArray} = await getAlbums(itemsIds, 'artist')

	itemsIds.forEach( (id, i) => {
		itemObject[id] =  albumArray[i]
	})

	if (!albumArray || !albumArray.length) {
		return data
	}

	const itemsWithLabels = items.map( (item, i) => ({
		label: item.label ? item.label : itemObject[item.id].label,
		popularity: item.popularity ? item.popularity : itemObject[item.id].popularity,

		...item,
	}) )
	return ({albums: { ...data['albums'], items: itemsWithLabels }})
}


const SearchResultsContatiner = (props) => {
	const [ data, setData ] = useContext( SearchResultsContext )

	const addStatus = async artistData => {
		const statusData = await addFollowingStatus(artistData)
		setData(statusData)
	}
	const addLabel = async albumData => {
		const statusData = await addLabelToAlbum(albumData)
		setData(statusData)
	}

	React.useEffect(() => {
		if( data && findType(data) === 'artists' ) {
			if (data['artists'].items.filter(({ following }) => following === undefined).length) {
				addStatus(data)
			}
		}
		if( data && findType(data) === 'albums' ) {
			if (data['albums'].items.filter(({ label }) => label === undefined).length) {
				addLabel(data)
			}
		}
	}, [data])

	if ( !data || !Object.keys(data).length  ) {
		return  <span id="search-results" />
	}
console.log( data )

	const followArtist = async(ids, checked) => {

		const success = checked 
			? await follow(ids, 'artist')
			: await unFollow(ids, 'artist')

		if ( success ) {
			const updatedItems = data['artists'].items.map((item) => {
				item.following = [].concat(ids).includes(item.id) ? checked : item.following
				return item
			})
			setData({artists: { ...data['artists'], items: updatedItems }})
		}
	}
	
	const addData = async(next) => {
		const moreData = await getHref(next)
		const moreType = findType(moreData)// this should be the same as type!

		const nextData = { [moreType]: {
			...moreData[moreType],
			items: [...data[type].items, ...moreData[moreType].items] 
		}}
		setData({...data, ...nextData})
	}

	const type = findType(data)

	let { next, offset, limit, total, items, href } = data[type]

	return (
		<SearchResults 
			offset={offset}
			limit={limit}
			total={total}
			type={type}
			href={href}
			next={next}
			items={items}
			data={data}
			addData={addData}
			followArtist={followArtist}
			{...props}
		/>)
}



export const handlePlay = (type, uri) => {
	let body = {}
	if ( type === 'tracks' ) {
		body = {uris: [uri]}
	}else if  ( type === 'albums' ){
		body = {context_uri: uri}
	}else {
		body = {context_uri: uri}
	}
	play(body)
}

const ArtistTable = ({ items, followArtist }) => (
		<table id="search-results" >
			<thead>
				<tr>
					<th>Name</th>
					<th>Popular</th>
					<th className="hide-up-md" >Fans</th>
					<th>Follow</th>
				</tr>
			</thead>
			<tbody>
	{ items.map( ({ artists, name, id, uri, popularity, followers, following })  => {

				return(
					<tr className="results__item" key={id} >
						<td onClick={() => handlePlay( 'artists', uri ) } >{name}</td>					
						<td><PopularityMeter className="popularity-meter" popularity={popularity} /></td>
						<td className="hide-up-md" >{followers.total.toString()}</td>
						<td style={{ textAlign: 'center' }} >
							<input
								onChange={({target: {checked}}) => followArtist(id, checked) }
								id="follow-check"
								type="checkbox"
								checked={following}
								name="followingLabel" />
						</td>
					</tr>
				) 
			})}
			</tbody>
		</table>
)
const AlbumTable = ({ items }) => (
		<table id="search-results" >
			<thead>
				<tr>
					<th>Name</th>
					<th>Artists</th>
					<th>Label</th>
					<th className="hide-up-sm" >Popular</th>
					<th className="hide-up-md" >Released</th>
					<th className="hide-up-md" >Type</th>
				</tr>
			</thead>
			<tbody>
	{ items.map( ({ label, popularity, album_type, release_date, artists, name, id, uri })  => {

				return(
					<tr className="results__item" key={id} >
						<td onClick={() => handlePlay( 'artists', uri ) } >{name}</td>					
						<td>{SpotifyHelpers.combineArtists(artists)}</td>
						<td>{label}</td>
						<td className="hide-up-sm" ><PopularityMeter className="popularity-meter" popularity={popularity} /></td>
						<td className="hide-up-md" >{release_date.split('-').reverse().join('-')}</td>
						<td className="hide-up-md" >{album_type}</td>
					</tr>
				) 
			})}
			</tbody>
		</table>
)


const SearchResults = ({ type, next, items, href, addData, followArtist, offset, limit, total }) => {

	const searchByLabel = href.includes('label')
	const shown = offset + limit 
	const more = total - shown
	const hasArtistsName = (type === 'tracks' || type === 'albums' ) //&& searchByLabel
	const hasPopulatity  = (type === 'tracks' || type === 'artists')

	//TODO Add different results tables for the Four types. 
	if ( !items.length ) {
		return <p id="search-results" >no results</p>
	}

	return (
		<div className="results" >
			{/* <Pagination count={items.length} limit={limit} total={total} offset={offset} onPageChange={onPageChange} /> */}
	{type === 'artists' &&
			<ArtistTable items={items} followArtist={followArtist} />  }
	{type === 'albums' &&
			<AlbumTable items={items} />  }
	{(type !== 'artists' && type !== 'albums') &&
			<table id="search-results" >
				<thead>
					<tr>
						<th>Name</th>
	{hasArtistsName && 
						<th>Artists</th>}
	{hasPopulatity && 
						<th>Popular</th>}
					</tr>
				</thead>
				<tbody>
	{ items.map( ({ artists, name, id, uri, popularity, followers })  => {
		let artistsNames;
		if ( hasArtistsName ) {
			artistsNames = SpotifyHelpers.combineArtists(artists)
		}
					return(
						<tr className="results__item" key={id} onClick={() => handlePlay( type, uri ) } >
							<td>{name}</td>
	{artistsNames && 
							<td>{artistsNames}</td>}
	{hasPopulatity &&							
							<td><PopularityMeter className="popularity-meter" popularity={popularity} /></td>}
	{type === 'artists' &&
							<td>{followers.total.toString()}</td>}							
						</tr>
					) 
				})}
				</tbody>
			</table>}
			<div className="next-icon__contatiner" >
	{ shown < total &&
					<>
					<p> {total} {type} </p> 
	{ next &&
					<ArrowDown onClick={ () => addData(next) } className="arrow-icon next-icon" /> }
					<p> {more} more  </p>
					</>}
			</div>
		</div>
	)
}

export default SearchResultsContatiner
