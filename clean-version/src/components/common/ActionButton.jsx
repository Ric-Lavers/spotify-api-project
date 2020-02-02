import React from "react";

const ActionButton = ({ Icon, label, action, className }) => (
  <div className={`action ${className}`} onClick={action}>
    {Icon && <Icon />}
    {label}
  </div>
);
export default ActionButton;
