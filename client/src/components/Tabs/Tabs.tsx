import React, { useState, useEffect } from 'react'

//TODO ?refactor then move

export const Tabs: React.FC<{
  tabList: {
    label: string
    id: string
    content: React.ReactNode
    onClick?: (id: string, options: { openTab: string }) => void
  }[]
  style: object
  enableChevrons: boolean
  enableLocal: boolean
}> = ({
  children: ToggleInactive,
  tabList = [
    { label: 'Skip list', id: 'skipList', content: <>skip list content</> },
    {
      label: 'Add current',
      id: 'addCurrent',
      content: <>add current content</>,
    },
  ],
  style = {},
  enableChevrons = false,
  enableLocal = false,
}) => {
  const useWithLocal = (): [string, (x: any) => any] => {
    const [openTab, setOpenTab] = useState(
      localStorage.getItem('OPEN_TAB') || tabList[0].id
    )

    useEffect(
      function OPEN_TABtoLocal() {
        enableLocal && localStorage.setItem('OPEN_TAB', openTab)
      },
      [openTab]
    )

    return [openTab, setOpenTab]
  }

  const [openTab, setOpenTab] = useWithLocal()
  let hideToggle = false
  const CurrentTab = (() => {
    try {
      return tabList.find(({ id }) => id === openTab).content
    } catch (_) {
      hideToggle = true
      return <></>
    }
  })()

  return (
    <div className="tabs">
      <nav className="tabs-menu" style={style}>
        {tabList.map(({ label, id, onClick = () => void {} }) => (
          <button
            key={`${id}-tab`}
            className={
              id === openTab
                ? `active ${enableChevrons ? 'DESC' : ''}`
                : enableChevrons
                ? 'ASC'
                : ''
            }
            onClick={() => {
              if (id === openTab) {
                setOpenTab('minimize')
              } else {
                setOpenTab(id)
                onClick(id, { openTab })
              }
            }}
          >
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="quick-actions">
        {!hideToggle && <>{ToggleInactive}</>}
      </div>
      <div className="tabs-content">{CurrentTab}</div>
    </div>
  )
}
