import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import ReactSpeedometer from "react-d3-speedometer";

const SpeedometerGroup = ({ title, overallRating, fuelEfficiency, power, make, vehicleNumber }) => {
  const label = make ? `${make}` : `Car ${vehicleNumber}`;

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  // Animated states for each metric
  const [displayedOverall, setDisplayedOverall] = useState(0);
  const [displayedFuel, setDisplayedFuel] = useState(0);
  const [displayedPower, setDisplayedPower] = useState(0);

  // Animate when in view
  useEffect(() => {
  if (inView) {
    // Animate values with overshoot
    const animateWithOvershoot = (setter, targetValue, overshootPercent = 0.05, duration = 2200) => {
      const frameRate = 20; // 20ms per frame
      const totalFrames = duration / frameRate;
      const overshootValue = targetValue * (1 + overshootPercent);

      let frame = 0;

      const interval = setInterval(() => {
        frame++;

        if (frame <= totalFrames * 0.7) {
          // First 70%: animate up to overshoot
          setter(Math.min((overshootValue * frame) / (totalFrames * 0.7), overshootValue));
        } else {
          // Last 30%: animate settle down to target
          const settleFrame = frame - totalFrames * 0.7;
          const settleTotalFrames = totalFrames * 0.3;
          const currentValue = overshootValue - ((overshootValue - targetValue) * (settleFrame / settleTotalFrames));
          setter(Math.max(currentValue, targetValue));
        }

        if (frame >= totalFrames) {
          setter(targetValue); // Final correction
          clearInterval(interval);
        }
      }, frameRate);
    };

    animateWithOvershoot(setDisplayedOverall, overallRating);
    animateWithOvershoot(setDisplayedFuel, fuelEfficiency);
    animateWithOvershoot(setDisplayedPower, power);
  }
}, [inView, overallRating, fuelEfficiency, power]);

  return (
    <div ref={ref} className="flex flex-col items-center space-y-6 w-full max-w-sm ">
      {[
        { label: "Overall Rating", value: displayedOverall, max: 100 },
        { label: "Fuel Efficiency", value: displayedFuel, max: 100 },
        { label: "Power", value: displayedPower, max: 10 },
      ].map((metric, i) => (
        <div key={i} className="w-full bg-white rounded-xl shadow-md p-4 flex flex-col items-center space-y-4 hover:scale-125 duration-200">
          <h4 className="font-semibold text-sm text-center font-sans bg-sky-400 text-white px-4 py-1 my-4 rounded-lg ">
            {label}
          </h4>
          <ReactSpeedometer
            value={metric.value}
            minValue={0}
            maxValue={metric.max}
            needleColor="#dc2626" 
            startColor="#ef4444" 
            endColor="#22c55e" 
            segments={10}
            textColor="#334155" 
            ringWidth={20}
            width={250}
            height={160}
            currentValueText={`${metric.label}: ${Math.round(metric.value)}`}
            needleTransitionDuration={1000}
            needleTransition="easeElastic"
          />
        </div>
      ))}
    </div>
  );
};

export default SpeedometerGroup;
