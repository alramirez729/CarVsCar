import React, { useState, useEffect } from 'react';

function Compare() {
  const [carData1, setCarData1] = useState([]);
  const [carData2, setCarData2] = useState([]);
  const [brand1, setBrand1] = useState('');
  const [model1, setModel1] = useState('');
  const [brand2, setBrand2] = useState('');
  const [model2, setModel2] = useState('');
  const [comparisonResult, setComparisonResult] = useState('');

  // Function to fetch data for a given make and model
  const fetchCarData = async (make, model, setData) => {
    try {
        const response = await fetch(`http://localhost:3000/api/cars?make=${make}&model=${model}`);
        
        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('application/json')) {
            const data = await response.json();
            setData(data);
        } else {
            const errorText = await response.text();
            console.error('Error fetching car data, response:', errorText);
        }
    } catch (error) {
        console.error('Error fetching car data:', error);
    }
};


  // Handle comparison
  const handleCompare = async () => {
    // Fetch data for both cars
    await fetchCarData(brand1, model1, setCarData1);
    await fetchCarData(brand2, model2, setCarData2);

    // Determine comparison result based on combined MPG
    if (carData1.length > 0 && carData2.length > 0) {
      const avgMPG1 = calculateAverageMPG(carData1);
      const avgMPG2 = calculateAverageMPG(carData2);

      const result =
        avgMPG1 > avgMPG2
          ? `${brand1} ${model1} has a higher average combined MPG (${avgMPG1}) than ${brand2} ${model2} (${avgMPG2}).`
          : `${brand2} ${model2} has a higher average combined MPG (${avgMPG2}) than ${brand1} ${model1} (${avgMPG1}).`;

      setComparisonResult(result);
    } else {
      setComparisonResult('One or both car models were not found.');
    }
  };

  // Calculate the average combined MPG for a set of cars
  const calculateAverageMPG = (cars) => {
    const totalMPG = cars.reduce((sum, car) => sum + car.combination_mpg, 0);
    return (totalMPG / cars.length).toFixed(1); // Return average MPG with 1 decimal point
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-cyan-700">
      <h1 className="text-3xl font-bold mb-5 text-center text-white">Car vs. Car</h1>

      <div className="flex flex-col md:flex-row md:justify-between w-full max-w-4xl gap-5">
        {/* Car 1 Input */}
        <div className="flex flex-col items-center bg-gray-300 p-5 rounded-lg shadow-md w-full md:w-1/2">
          <h2 className="text-xl font-bold mb-3">Car 1</h2>
          <input
            type="text"
            value={brand1}
            onChange={(e) => setBrand1(e.target.value)}
            placeholder="Enter Car 1 Make"
            className="w-full p-2 border rounded-md mb-2"
          />
          <input
            type="text"
            value={model1}
            onChange={(e) => setModel1(e.target.value)}
            placeholder="Enter Car 1 Model"
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Car 2 Input */}
        <div className="flex flex-col items-center bg-gray-300 p-5 rounded-lg shadow-md w-full md:w-1/2">
          <h2 className="text-xl font-bold mb-3">Car 2</h2>
          <input
            type="text"
            value={brand2}
            onChange={(e) => setBrand2(e.target.value)}
            placeholder="Enter Car 2 Make"
            className="w-full p-2 border rounded-md mb-2"
          />
          <input
            type="text"
            value={model2}
            onChange={(e) => setModel2(e.target.value)}
            placeholder="Enter Car 2 Model"
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <button
        onClick={handleCompare}
        className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Compare
      </button>

      {comparisonResult && (
        <div className="mt-5 p-5 bg-white rounded-lg shadow-md">
          <p className="text-lg font-semibold">{comparisonResult}</p>
        </div>
      )}
    </div>
  );
}

export default Compare;
