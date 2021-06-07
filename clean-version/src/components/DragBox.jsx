import React from 'react'

class DragBox extends React.Component {
  constructor(props) {
    super(props)
    this.container = React.createRef()
    this.state = {
      hasCapture: false,
      containerLeft: 0,
      containerTop: 0,
    }
  }

  componentDidMount() {
    const height = this.container.current.firstChild.clientHeight
    this.setState({ containerTop: -(height + 7) })
  }
  isDragging = false
  previousLeft = 0
  previousTop = 0

  onDown = (event) => {
    this.isDragging = true
    event.target.setPointerCapture(event.pointerId)

    // We store the initial coordinates to be able to calculate the changes
    // later on.
    this.extractPositionDelta(event)
  }

  onMove = (event) => {
    if (!this.isDragging) {
      return
    }
    const { left, top } = this.extractPositionDelta(event)

    this.setState(({ containerLeft, containerTop }) => ({
      containerLeft: containerLeft + left,
      containerTop: containerTop + top,
    }))
  }

  onUp = (event) => (this.isDragging = false)
  onGotCapture = (event) => this.setState({ hasCapture: true })
  onLostCapture = (event) => this.setState({ hasCapture: false })

  extractPositionDelta = (event) => {
    const left = event.pageX
    const top = event.pageY
    const delta = {
      left: left - this.previousLeft,
      top: top - this.previousTop,
    }
    this.previousLeft = left
    this.previousTop = top
    return delta
  }

  render() {
    const { children } = this.props
    const { hasCapture, containerLeft, containerTop } = this.state

    const boxStyle = {
      position: 'absolute',
    }

    const grabElement = {
      position: 'absolute',
      left: containerLeft,
      top: containerTop,
      cursor: this.isDragging ? 'grabbing' : 'grab',
    }

    return (
      <div style={boxStyle}>
        <div
          style={grabElement}
          onPointerDown={this.onDown}
          onPointerMove={this.onMove}
          onPointerUp={this.onUp}
          onPointerCancel={this.onUp}
          onGotPointerCapture={this.onGotCapture}
          onLostPointerCapture={this.onLostCapture}
          ref={this.container}
        >
          {children}
        </div>
      </div>
    )
  }
}

export default DragBox
