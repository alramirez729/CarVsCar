import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const SingleMetricChart = ({ comparisonData }) => {
  // Normalize the keys
  const normalizeKey = (key) => key.replace(/\s+/g, '_').toLowerCase();

  const car1Key = normalizeKey(comparisonData.car1.make);
  const car2Key = normalizeKey(comparisonData.car2.make);

  // Prepare data for the chart
  const isCar1Better = parseFloat(comparisonData.car1.value) > parseFloat(comparisonData.car2.value);
  const isCar2Better = parseFloat(comparisonData.car2.value) > parseFloat(comparisonData.car1.value);

  const data = [
    {
      metric: comparisonData.metricLabel,
      [car1Key]: parseFloat(comparisonData.car1.value),
      [car2Key]: parseFloat(comparisonData.car2.value),
    },
  ];

  const CustomTooltip = ({ active, payload, label, coordinate }) => {
  
    if (active && payload && payload.length) {
      const tooltipStyle = {
        position: 'absolute',
        left: `${coordinate.x + 100}px`, // 20px offset to the right of the bar
        top: `${coordinate.y - 10}px`, // Slight adjustment vertically
        transform: 'translateX(0)', // Prevent shifting
        zIndex: 10,
        width: '250px',
      };
      return (
        <div
        style={tooltipStyle} 
        className="bg-white border border-gray-300 p-4 rounded-lg shadow-md font-mono ring-2 ring-slate-500">
          <p className="font-bold text-lg mb-2 italic">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="text-sm">
              <span
                className="font-medium italic font-bold font-mono"
                style={{ color: entry.color }}
              >
                {entry.name}
              </span>: {entry.value} {label}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Axis Tick for Tailwind Styling
  const CustomTick = ({ x, y, payload }) => (
    <text
      x={x}
      y={y}
      dy={16} // Adjust vertical positioning
      textAnchor="middle"
      className="text-gray-600 text-sm font-mono"
    >
      {payload.value}
    </text>
  );

  // Custom Y-Axis Label
  const CustomYAxisTick = ({ x, y, payload }) => (
    <text
      x={x}
      y={y}
      dx={-8} // Adjust horizontal positioning
      textAnchor="end"
      className="text-gray-600 text-sm font-mono"
    >
      {payload.value}
    </text>
  );

  // Custom Legend Component
  const CustomLegend = ({ payload }) => (
    <div className="flex justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-item-${index}`} className="flex items-center gap-2">
          <span
            className="block w-4 h-4 rounded-full ring-0 ring-slate-500"
            style={{ backgroundColor: entry.color }}
          ></span>
          <span className="text-sm font-mono text-gray-700">{entry.value.charAt(0).toUpperCase() + entry.value?.slice(1)}</span>
        </div>
      ))}
    </div>
  );

  return (
    <BarChart
      barGap={30}
      width={500}
      height={300}
      data={data}
      margin={{
        top: 5, right: 30, left: 20, bottom: 5,
      }}
    >
      <XAxis
        dataKey="metric"
        tick={<CustomTick />} // Custom Tick Component for X-Axis
      />
      <YAxis
        tick={<CustomYAxisTick />} // Custom Tick Component for Y-Axis
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend content={<CustomLegend />} /> {/* Use Custom Legend */}
      <Bar
        className="font-mono"
        dataKey={car1Key}
        fill={isCar1Better ? 'green' : isCar2Better ? 'pink' : 'gray'}
        barSize={70}
      />
      <Bar
        className="font-mono"
        dataKey={car2Key}
        fill={isCar2Better ? 'green' : isCar1Better ? 'pink' : 'gray'}
        barSize={70}
      />
    </BarChart>
  );
};

export default SingleMetricChart;
