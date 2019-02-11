import React, { useState, useCallback, useEffect, Component } from 'react'

const useToggle = intialValue => {
  const [ value, setValue ] = useState( intialValue )

  const toggler = useCallback( () => {
    setValue(!value) 
  })

  return [ value, toggler ]
}

const useColorOnInput = () => {
	const colors = ['#61DAFB', '#1DB954', '#FF760C', '#FF40DE']
	const [ length, setValue ] = useState(0)
	const [ color, setColor ] = useState(colors[0]) 

	const onInput = ({target}) => {
		const len = target.value.length;
		if ( len ) {
			setValue(len)
		}
	}
	useEffect( () => {
		setColor( colors[ Math.random() * colors.length | 0 ] )
	}, [length])

	return [ {border: `8px solid ${color}`}, onInput ]
}

const useHandleChange = (inialState) => {
	const [ formState, setFormState ] = useState(inialState)
	
	const handleChange = ({ target }) => {
		let { name, value, checked, type } = target
		if (type === 'checkbox') value = checked

		setFormState({ ...formState, [name]: value }) 
	}

	return [ formState, handleChange ]
}

const useWindowWidth = () => {
	const [width, setWidth] = useState(window.innerWidth);
	
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  
  return width;
}

const withWindowWidth = WrappedComponent => {
	return class extends Component {

		state = {
			width: window.innerWidth
		}

		componentDidMount(){
			window.addEventListener('resize', this.handleResize);
		}
		componentWillUnmount() {
			window.removeEventListener('resize', this.handleResize);
		}

		handleResize = () => this.setState({ width: window.innerWidth });

		render() {
			return (
				<WrappedComponent widthHOC={this.state.width}/>
			)
		}
	}
}

class WindowWidthWrapper extends Component {

	state = {
		width: window.innerWidth
	}

	componentDidMount(){
		window.addEventListener('resize', this.handleResize);
	}
	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	handleResize = () => this.setState({ width: window.innerWidth });

	render() {
		return  this.props.children(this.state.width)
	}
}


export {
	useToggle,
	useHandleChange,
	useWindowWidth,
	withWindowWidth,
	WindowWidthWrapper,
	useColorOnInput,
}