import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

function Compare() {
  const [carData1, setCarData1] = useState([]);
  const [carData2, setCarData2] = useState([]);
  const [brand1, setBrand1] = useState('');
  const [model1, setModel1] = useState('');
  const [year1, setYear1] = useState('');
  const [brand2, setBrand2] = useState('');
  const [model2, setModel2] = useState('');
  const [year2, setYear2] = useState('');
  const [comparisonResult, setComparisonResult] = useState([]);
  const [metricExplanationVisible, setMetricExplanationVisible] = useState({});

  //drop down menu items

  const [makeOptions, setMakeOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);


  // Function to fetch data for a given make, model, and year
  const fetchCarData = async (make, model, year) => {
    try {
      const response = await fetch(`http://localhost:3000/api/cars?make=${make}&model=${model}&year=${year}`);
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        console.error('Error fetching car data:', await response.text());
        return [];
      }
    } catch (error) {
      console.error('Error fetching car data:', error);
      return [];
    }
  };

  // Handle comparison
  const handleCompare = async () => {
    // Fetch data for both cars
    const data1 = await fetchCarData(brand1, model1, year1);
    const data2 = await fetchCarData(brand2, model2, year2);

    setCarData1(data1);
    setCarData2(data2);

    // Wait for state to update before calculating comparison
    if (data1.length > 0 && data2.length > 0) {
      setTimeout(() => {
        generateComparison(data1, data2);
      }, 100); // Allow time for state to update before comparison
    } else {
      setComparisonResult([<p key="error">One or both car models were not found.</p>]);
    }
  };

  // Function to generate comparison
  const generateComparison = (data1, data2) => {
    const metrics = ['combination_mpg', 'city_mpg', 'highway_mpg', 'cylinders', 'displacement'];
    const metricLabels = {
      combination_mpg: "Combined MPG",
      city_mpg: "City MPG",
      highway_mpg: "Highway MPG",
      cylinders: "Cylinders",
      displacement: "Displacement (L)"
    };

    const boxes = metrics.map((metric) => {
      const avg1 = calculateAverageMetric(data1, metric);
      const avg2 = calculateAverageMetric(data2, metric);

      return (
        <MetricComparisonBox
          key={metric}
          metric={metric}
          metricLabel={metricLabels[metric]}
          car1={{ brand: brand1, model: model1, year: year1, value: avg1 }}
          car2={{ brand: brand2, model: model2, year: year2, value: avg2 }}
        />
      );
    });

    setComparisonResult(boxes);
  };

  // General function to calculate the average of any given metric
  const calculateAverageMetric = (cars, metric) => {
    const total = cars.reduce((sum, car) => sum + (car[metric] || 0), 0);
    return (total / cars.length).toFixed(1);
  };


  const MetricComparisonBox = ({ metric, metricLabel, car1, car2 }) => {
    const [explanationVisible, setExplanationVisible] = useState(false);
  
    const toggleExplanation = () => {
      setExplanationVisible(!explanationVisible);
    };
  
    return (
      <div className="flex flex-col items-start p-5 bg-gray-100 rounded-lg shadow-md mb-4 w-full">
        <div className="flex items-center mb-2">
          <h3 className="text-xl font-bold">{metricLabel}</h3>
          <FontAwesomeIcon 
            icon={faQuestionCircle} 
            className="ml-2 text-blue-600 cursor-pointer" 
            onClick={toggleExplanation} 
          />
        </div>
        {explanationVisible && (
          <p className="text-sm text-gray-600 mb-3">
            {metricExplanations[metric]}
          </p>
        )}
        <p>{car1.brand} {car1.model} ({car1.year}): {car1.value}</p>
        <p>{car2.brand} {car2.model} ({car2.year}): {car2.value}</p>
      </div>
    );
  };

  // Explanations for each metric in layman's terms
  const metricExplanations = {
    combination_mpg: "Combined MPG is the average fuel efficiency of the car, combining both city and highway driving.",
    city_mpg: "City MPG is how many miles the car can travel on one gallon of fuel in city driving conditions.",
    highway_mpg: "Highway MPG is how many miles the car can travel on one gallon of fuel on the highway.",
    cylinders: "Cylinders are the components of an engine that provide power. More cylinders typically mean more power but less fuel efficiency.",
    displacement: "Displacement is the total volume of all the cylinders in the engine, usually measured in liters. It is an indicator of engine size and power."
  };

  const fetchMakeOptions = async (input) => {
    if (input.length < 2) return; // Fetch only if the input has at least 2 characters
    try {
      const response = await fetch(`http://localhost:3000/api/cars?make=${input}`);
      if (response.ok) {
        const data = await response.json();
        const uniqueMakes = [...new Set(data.map(car => car.make))];
        setMakeOptions(uniqueMakes);
      }
    } catch (error) {
      console.error('Error fetching makes:', error);
    }
  };
  
  const fetchModelOptions = async (make, input) => {
    if (make && input.length >= 2) {
      try {
        const response = await fetch(`http://localhost:3000/api/cars?make=${make}&model=${input}`);
        if (response.ok) {
          const data = await response.json();
          const uniqueModels = [...new Set(data.map(car => car.model))];
          setModelOptions(uniqueModels);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    }
  };
  
  const fetchYearOptions = async (make, model) => {
    if (make && model) {
      try {
        const response = await fetch(`http://localhost:3000/api/cars?make=${make}&model=${model}`);
        if (response.ok) {
          const data = await response.json();
          const uniqueYears = [...new Set(data.map(car => car.year))];
          setYearOptions(uniqueYears);
        }
      } catch (error) {
        console.error('Error fetching years:', error);
      }
    }
  };




  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-cyan-700">
      <h1 className="text-3xl font-bold mb-5 text-center text-white">Car vs. Car</h1>

      <div className="flex flex-col md:flex-row md:justify-between w-full max-w-4xl gap-5">
        {/* Car 1 Input */}
        <div className="flex flex-col items-center bg-gray-300 p-5 rounded-lg shadow-md w-full md:w-1/2">
          <h2 className="text-xl font-bold mb-3">Car 1</h2>
          <input type="text" value={brand1} onChange={(e) => setBrand1(e.target.value)} placeholder="Enter Car 1 Make" className="w-full p-2 border rounded-md mb-2" />
          <input type="text" value={model1} onChange={(e) => setModel1(e.target.value)} placeholder="Enter Car 1 Model" className="w-full p-2 border rounded-md mb-2" />
          <input type="text" value={year1} onChange={(e) => setYear1(e.target.value)} placeholder="Enter Car 1 Year" className="w-full p-2 border rounded-md" />
        </div>

        {/* Car 2 Input */}
        <div className="flex flex-col items-center bg-gray-300 p-5 rounded-lg shadow-md w-full md:w-1/2">
          <h2 className="text-xl font-bold mb-3">Car 2</h2>
          <input type="text" value={brand2} onChange={(e) => setBrand2(e.target.value)} placeholder="Enter Car 2 Make" className="w-full p-2 border rounded-md mb-2" />
          <input type="text" value={model2} onChange={(e) => setModel2(e.target.value)} placeholder="Enter Car 2 Model" className="w-full p-2 border rounded-md mb-2" />
          <input type="text" value={year2} onChange={(e) => setYear2(e.target.value)} placeholder="Enter Car 2 Year" className="w-full p-2 border rounded-md" />
        </div>
      </div>

      <button onClick={handleCompare} className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        Compare
      </button>

      {comparisonResult && <div className="mt-5 w-full max-w-4xl">{comparisonResult}</div>}
    </div>
  );
}

export default Compare;
