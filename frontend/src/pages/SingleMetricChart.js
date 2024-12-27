import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SingleMetricChart = ({ comparisonData }) => {
  // Prepare data for the chart
  const data = [
    {
      metric: comparisonData.metricLabel, // Label for the metric
      car1: parseFloat(comparisonData.car1.value), // Value for Car 1
      car2: parseFloat(comparisonData.car2.value), // Value for Car 2
    },
  ];

  return (
    <BarChart
      width={500}
      height={300}
      data={data}
      margin={{
        top: 5, right: 30, left: 20, bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="metric" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="car1" fill="#82ca9d" />
      <Bar dataKey="car2" fill="#8884d8" />
    </BarChart>
  );
};

export default SingleMetricChart;
