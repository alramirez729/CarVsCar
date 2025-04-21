// SpeedometerGroup.js
import React from 'react';
import ReactSpeedometer from "react-d3-speedometer";

const SpeedometerGroup = ({ title, overallRating, fuelEfficiency, power, make, vehicleNumber }) => {
  const label = make ? `${make}` : `Car ${vehicleNumber}`;

  return (
      <div className="flex flex-col items-center space-y-6 w-full max-w-sm ">
{[
        { label: "Overall Rating", value: overallRating, max: 100 },
        { label: "Fuel Efficiency", value: fuelEfficiency, max: 100 },
        { label: "Power", value: power, max: 10 },
      ].map((metric, i) => (
      <div className="w-full bg-white rounded-xl shadow-md p-4 flex flex-col items-center space-y-4 hover:scale-125 duration-200">
      <h4 className="font-semibold text-sm text-center font-sans bg-sky-400 text-white px-4 py-1 my-4 rounded-lg ">
            {label}
          </h4>
          <ReactSpeedometer
            value={metric.value}
            minValue={0}
            maxValue={metric.max}
            needleColor="#dc2626" // Tailwind red-600
            startColor="#ef4444" // red-500
            endColor="#22c55e" // green-500
            segments={10}
            textColor="#334155" // slate-700
            ringWidth={20}
            width={250}
            height={160}
            currentValueText={`${metric.label}: ${metric.value}`}
            needleTransitionDuration={1000}
            needleTransition="easeElastic"
          />

        </div>
      ))}
    </div>
  );
};

export default SpeedometerGroup;
