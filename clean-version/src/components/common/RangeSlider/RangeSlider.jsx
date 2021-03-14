import React, { useState, useEffect } from "react";
import { Range, getTrackBackground } from "react-range";

const RangeSlider = ({ min = 0, max = 1, onRangeChange = () => void {} }) => {
  const [rangeValues, setRangeValues] = useState([min, max]);

  useEffect(() => {
    setRangeValues([min, max]);
  }, [min, max]);

  return (
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
                  colors: ["#ccc", "#1DB954", "#ccc"],
                  min,
                  max
                })
              }}
            >
              {children}
            </div>
          );
        }}
        renderThumb={({ props }) => {
          return (
            <div
              {...props}
              data-value={props["aria-valuenow"]}
              className="thumb"
            />
          );
        }}
      />
    </div>
  );
};

export default RangeSlider;
