import React, { useMemo } from 'react'
import classNames from 'classnames'

export const Button = ({ lastTouch, text, action, onClick }) =>{ 
  const wasLastAction = lastTouch[action]
  
  return useMemo(() => {
    console.count( 'Presenational Button' )
    const isValid = typeof wasLastAction === 'boolean'

    return(
      <div
        className={classNames("icon",{
          'touched-success': wasLastAction && isValid,
          'touched-error': !wasLastAction && isValid
        })}
        onClick={() => onClick(action)}
      >{ text }</div>
    )}, [ wasLastAction ]
  )}


class ButtonClass extends React.Component {

  shouldComponentUpdate( nextProps ) {
    const { action, lastTouch } = this.props
    return nextProps.lastTouch[action] !== lastTouch[action]
  }

  render(){
    const { lastTouch, text, action, onClick } = this.props;
console.count( 'Class Button' )
    return (
      <div
        className={classNames("icon",
          {[lastTouch[action]?'touched-success':'touched-error']: (typeof lastTouch[action] === 'boolean')}
        )}
        onClick={() => onClick(action)}
      >
        { text }
      </div>
      )
  }
}

export default ButtonClass;
