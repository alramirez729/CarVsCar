import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// You can customize these components if you want
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-md text-xs">
        <p className="font-bold">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RenderBarChart = ({ metricLabel, car1, car2 }) => {
  const data = [
    {
      metric: metricLabel,
      [car1.make]: parseFloat(car1.value),
      [car2.make]: parseFloat(car2.value),
    },
  ];

  return (
    <div className="flex justify-center items-center w-full bg-white" style={{ minHeight: '300px' }}>
      <BarChart
        width={400}
        height={250}
        data={data}
        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        barGap={30}
      >
        <XAxis dataKey="metric" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey={car1.make} fill="#7dd3fc" barSize={45} />
        <Bar dataKey={car2.make} fill="#cc49ff" barSize={45} />
      </BarChart>
    </div>
  );
};

export default RenderBarChart;
