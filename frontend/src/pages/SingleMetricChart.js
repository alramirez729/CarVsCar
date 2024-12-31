import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const SingleMetricChart = ({ comparisonData }) => {
  // Prepare data for the chart

  const isCar1Better = parseFloat(comparisonData.car1.value) > parseFloat(comparisonData.car2.value);
  const isCar2Better = parseFloat(comparisonData.car2.value) > parseFloat(comparisonData.car1.value);
  
  const data = [
    {
      metric: comparisonData.metricLabel, // Label for the metric
      [comparisonData.car1.make]: parseFloat(comparisonData.car1.value), // Value for Car 1
      [comparisonData.car2.make]: parseFloat(comparisonData.car2.value), // Value for Car 2
    },
  ];

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
      <XAxis dataKey="metric" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar
        dataKey={comparisonData.car1.make}
        fill={isCar1Better ? 'green' : isCar2Better ? 'pink' : 'gray'} // Dynamic color
        barSize={70}    
        
      />
      <Bar
        dataKey={comparisonData.car2.make}
        fill={isCar2Better ? 'green' : isCar1Better ? 'pink' : 'gray'} // Dynamic color
        barSize={70}
      />
    </BarChart>
  );
};

export default SingleMetricChart;
