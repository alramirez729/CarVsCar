import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

    // ✅ Bar Chart method
    const RenderBarChart = ({ metricLabel, car1, car2 }) => {
    const data = [
      {
        metric: metricLabel,
        [car1.make]: parseFloat(car1.value),
        [car2.make]: parseFloat(car2.value),
      },
    ];

    // Custom Axis Tick for Tailwind Styling
    const CustomTick = ({ x, y, payload }) => (
      <text
        x={x}
        y={y}
        dy={16} // Adjust vertical positioning
        textAnchor="middle"
        className="text-gray-600 text-sm font-sans"
      >
        {payload.value}
      </text>
    );

    // Custom Y-Axis Label
    const CustomYAxisTick = ({ x, y, payload }) => (
      <text
        x={x}
        y={y}
        dx={0} // Adjust horizontal positioning
        textAnchor="end"
        className="text-gray-600 text-sm font-sans"
      >
        {payload.value}
      </text>
    );

    const CustomLegend = ({ payload }) => (
      <div className="flex justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <div key={`legend-item-${index}`} className="flex items-center gap-2">
            <span
              className="block w-4 h-4 rounded-full ring-0 ring-slate-500"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="text-sm font-sans text-gray-700">{entry.value.charAt(0).toUpperCase() + entry.value?.slice(1)}</span>
          </div>
        ))}
      </div>
    );

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
          className="bg-white border border-gray-300 p-4 rounded-lg shadow-md font-sans ring-2 ring-slate-500">
            <p className="font-bold text-lg mb-2 italic">{label}</p>
            {payload.map((entry, index) => (
              <div key={`item-${index}`} className="text-sm">
                <span
                  className="font-medium italic font-bold font-sans"
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

    return (
      <BarChart barGap={30} width={400} height={250} data={data}>
        <XAxis dataKey="metric" 
              tick={<CustomTick />} // Custom Tick Component for X-Axis
        />
        <YAxis 
          tick={<CustomYAxisTick />} // Custom Tick Component for Y-Axis
        />
        <Tooltip content={<CustomTooltip />}/>
        <Legend content={<CustomLegend />} />
        <Bar
          className="font-sans"
          dataKey={car1.make}
          fill={'#7dd3fc'}
          barSize={70}
        />
        <Bar
          className="font-sans"
          dataKey={car2.make}
          fill={'#cc49ff'}
          barSize={70}
        />
      </BarChart>
    );
  };

export default RenderBarChart;