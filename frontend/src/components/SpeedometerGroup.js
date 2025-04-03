// SpeedometerGroup.js
import React from 'react';
import ReactSpeedometer from "react-d3-speedometer";

const SpeedometerGroup = ({ title, overallRating, fuelEfficiency, power, make, vehicleNumber }) => {
  const label = make ? `${make}` : `Car ${vehicleNumber}`;

  return (
    <div className="flex flex-col col-3 md:col-2 sm:col1 items-center lg:space-y-6 sm:space-y-0">
      {[
        { label: "Overall Rating", value: overallRating, max: 100 },
        { label: "Fuel Efficiency", value: fuelEfficiency, max: 100 },
        { label: "Power", value: power, max: 10 },
      ].map((metric, i) => (
        <div key={i} className="box_with_shadow flex flex-col items-center lg:space-y-6 sm:space-y-0">
          <h4 className="font-semibold text-sm text-center font-sans bg-sky-400 text-white px-4 py-1 my-4 rounded-lg">
            {label}
          </h4>
          <ReactSpeedometer
            value={metric.value}
            minValue={0}
            maxValue={metric.max}
            needleColor="red"
            startColor="red"
            endColor="green"
            segments={10}
            textColor="#000"
            currentValueText={`${metric.label}: ${metric.value}`}
          />
        </div>
      ))}
    </div>
  );
};

export default SpeedometerGroup;
