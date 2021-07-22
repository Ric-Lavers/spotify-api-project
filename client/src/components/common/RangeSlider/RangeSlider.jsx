import React, { useState, useEffect } from "react"
import { Range, getTrackBackground } from "react-range"
import ErrorBoundary from "components/ErrorBoundary"

const RangeSlider = ({ min = 0, max = 1, onRangeChange = () => void {} }) => {
  const [rangeValues, setRangeValues] = useState([min, max])

  useEffect(() => {
    setRangeValues([min, max])
  }, [min, max])

  if (min + max === 0 || rangeValues[1] < rangeValues[0]) return null

  return (
    <ErrorBoundary>
      <div className="range-slider">
        <Range
          step={0.01}
          min={min}
          max={max}
          onChange={setRangeValues}
          onFinalChange={onRangeChange}
          values={rangeValues}
          renderTrack={({ props, children }) => {
            return (
              <div
                {...props}
                className="track"
                style={{
                  background: getTrackBackground({
                    values: rangeValues,
                    colors: ["#404040", "#1DB954", "#404040"],
                    min,
                    max
                  })
                }}
              >
                {children}
              </div>
            )
          }}
          renderThumb={({ props }) => {
            return (
              <div
                {...props}
                data-value={props["aria-valuenow"]}
                className="thumb"
                style={{
                  ...props.style,
                  backgroundColor: "#fff"
                }}
              />
            )
          }}
        />
      </div>
    </ErrorBoundary>
  )
}

export default RangeSlider
