import React, { useMemo, useState } from "react"
import classNames from "classnames"

const PlayerButton = ({ text, action, onClick }) => {
  const [successClass, setSuccess] = useState("")

  const handleClick = () => {
    const isSuccess = onClick(action) ? "touched-success" : "touched-error"
    setSuccess(isSuccess)
    window.navigator.vibrate(200)
    setTimeout(() => {
      setSuccess("")
    }, 1000)
  }

  const formatButton = useMemo(
    () => (
      <div className={classNames("icon", successClass)} onClick={handleClick}>
        {text}
      </div>
    ),
    [handleClick, successClass, text]
  )

  return formatButton
}

/* 
class ButtonClass extends React.Component {

  state = {
    isSuccess: ''
  }

  handleClick = () => {
    const isSuccess = this.props.onClick(this.props.action) ? 'touched-success' : 'touched-error'
    this.setState({ isSuccess })
    setTimeout( () => {
      this.setState({ isSuccess: '' })
    }, 1000 )
  }

  render(){
    const { lastTouch, text, action, onClick, isValid } = this.props;
    const { isSuccess } = this.state;
console.count( 'Class Button' )
    return (
      <div
        className={classNames("icon",
          {[lastTouch[action]?'touched-success':'touched-error']: (typeof lastTouch[action] === 'boolean')}
        )}
        onClick={() => onClick(action)}
      >{ text } </div>
      )
  }
} */

export default PlayerButton
