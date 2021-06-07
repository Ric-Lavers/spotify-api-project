import React from 'react'

const ActionButton = ({ Icon, label, action, className, tooltip }) => (
  <div
    className={`tooltip action ${(Icon && 'icon-button') || ''} ${className}`}
    onClick={action}
  >
    {tooltip && <span class="tooltiptext">{tooltip}</span>}
    {Icon && <Icon />}

    {label}
  </div>
)

ActionButton.defaultProps = {
  tooltip: '',
}

export default ActionButton
