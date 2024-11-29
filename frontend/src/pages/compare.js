import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faCarSide } from '@fortawesome/free-solid-svg-icons';

function Compare() {

  const [make1, setBrand1] = useState('');
  const [model1, setModel1] = useState('');
  const [year1, setYear1] = useState('');
  const [make2, setBrand2] = useState('');
  const [model2, setModel2] = useState('');
  const [year2, setYear2] = useState('');
  const [comparisonResult, setComparisonResult] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState('');



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

  const fetchSuggestions = async (query = '', type) => {
    if (!query) return setSuggestions([]);
  
    try {
      // Ensure `make` is used instead of `brand`
      const response = await fetch(`http://localhost:3000/api/cars?${type}=${query}`);
      
      if (!response.ok) {
        console.error(`Error fetching suggestions: ${response.statusText}`);
        return setSuggestions([]); // Clear suggestions if the fetch fails
      }
  
      const data = await response.json();
  
      // Extract unique suggestions for the input type (make, model, etc.)
      const uniqueSuggestions = [...new Set(data.map(car => car[type]))];
      setSuggestions(uniqueSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]); // Clear suggestions on error
    }
  };
  
  

  // Handle comparison
  const handleCompare = async () => {

    // Validate inputs for both cars
    if (!make1 || !model1 || !year1) {
      alert('Please fill in all fields for Car 1.');
      return;
    }
    if (!make2 || !model2 || !year2) {
      alert('Please fill in all fields for Car 2.');
      return;
    }
    // Fetch data for both cars
    try {
      const data1 = await fetchCarData(make1, model1, year1);
      const data2 = await fetchCarData(make2, model2, year2);
  
      if (data1.length === 0 || data2.length === 0) {
        alert('Invalid car details. Please check your inputs.');
        return;
      }
  
      generateComparison(data1, data2);
    } catch (error) {
      console.error('Error comparing cars:', error);
      alert('An error occurred during comparison. Please try again.');
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
        <MetricComparisonRow
          key={metric}
          metric={metric}
          metricLabel={metricLabels[metric]}
          car1={{ make: make1, model: model1, year: year1, value: avg1 }}
          car2={{ make: make2, model: model2, year: year2, value: avg2 }}
        />
      );
    });

    setComparisonResult(boxes);
  };

  // General function to calculate the average of any given metric
  const calculateAverageMetric = (cars, metric) => {
    const total = cars.reduce((sum, car) => sum + (parseFloat(car[metric]) || 0), 0);
    return (total / cars.length).toFixed(1);
  };

  // Component for each metric row with two car cards
  // MetricComparisonRow component
  const MetricComparisonRow = ({ metric, metricLabel, car1, car2 }) => {
    const [explanationVisible, setExplanationVisible] = useState(false);
  
    // Compare metric values
    const car1Value = parseFloat(car1.value);
    const car2Value = parseFloat(car2.value);
    const isCar1Better = car1Value > car2Value;
    const isCar2Better = car2Value > car1Value;
  
    const toggleExplanation = () => setExplanationVisible(!explanationVisible);
  
    // Utility to get the shortened metric label
    const getShortMetricLabel = (metricLabel) => {
      const words = metricLabel.split(" ");
      return words.slice(1).join(" ") || metricLabel;
    };
  
    return (
      <div className="animate-fade-in flex flex-col items-start p-5 bg-gray-100 rounded-lg shadow-md mb-4 w-full">
        {/* Metric Label and Explanation */}
        <div className="flex items-center mb-2 w-full justify-between">
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
        {/* Car 1 and Car 2 Cards */}
        <div className="flex flex-row w-full gap-4">
          {/* Car 1 Card */}
          <div
            className={`animate-fade-in flex flex-col items-center p-4 rounded-lg shadow-md w-1/2 transition-colors duration-900
              ${isCar1Better ? 'bg-green-200' : isCar2Better ? 'bg-red-200' : 'bg-white'}`}
          >
            <h4 className="font-semibold">Car 1: {car1.make} {car1.model} ({car1.year})</h4>
            <p className="mt-1">{car1.value + " " + getShortMetricLabel(metricLabel)}</p>
          </div>
          {/* Car 2 Card */}
          <div
            className={`animate-fade-in flex flex-col items-center p-4 rounded-lg shadow-md w-1/2 transition-colors duration-900
              ${isCar2Better ? 'bg-green-200' : isCar1Better ? 'bg-red-200' : 'bg-white'}`}
          >
            <h4 className="font-semibold">Car 2: {car2.make} {car2.model} ({car2.year})</h4>
            <p className="mt-1">{car2.value + " " + getShortMetricLabel(metricLabel)}</p>
          </div>
        </div>
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

  return (
    <div className="flex flex-col items-center justify-center w-full my-min-h-screen p-5 bg-white">
      <h1 className="heading bg-gray-200 rounded-l h-20 border-b-gray-300 border-2 p-5">Car Comparison</h1>
      <h1 className="subheading">Select two vehicles to see how they compare.</h1>

      <div className="flex flex-col md:flex-row md:justify-between w-full max-w-4xl gap-5 my-10">
        {/* Car 1 Input */}
      <div className="box_with_shadow">
        <FontAwesomeIcon icon ={faCarSide} size="3x"/>
        <h2 className="subtitle">Car 1 </h2>

        {/* Brand 1 Input with Dropdown */}
        <div className="relative w-full">
          <input 
            type="text" 
            value={make1} 
            onChange={(e) => {
              setBrand1(e.target.value);
              fetchSuggestions(e.target.value, 'make');
              setActiveInput('make1');
            }}
            onFocus={() => setActiveInput('make1')}
            onBlur={() => setTimeout(() => setSuggestions([]), 100)} // Delay to capture click on dropdown
            placeholder="Enter Car 1 Make" 
            className="w-full p-2 border rounded-md mb-2" 
          />
          {activeInput === 'make1' && suggestions.length > 0 && (
            <ul className="absolute bg-white border rounded-md w-full z-10 max-h-40 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => {
                    setBrand1(suggestion);
                    setSuggestions([]);
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Model 1 Input with Dropdown */}
        <div className="relative w-full">
          <input 
            type="text" 
            value={model1} 
            onChange={(e) => {
              setModel1(e.target.value);
              fetchSuggestions(e.target.value, 'model');
              setActiveInput('model1');
            }}
            onFocus={() => setActiveInput('model1')}
            onBlur={() => setTimeout(() => setSuggestions([]), 100)}
            placeholder="Enter Car 1 Model" 
            className="w-full p-2 border rounded-md mb-2" 
          />
          {activeInput === 'model1' && suggestions.length > 0 && (
            <ul className="absolute bg-white border rounded-md w-full z-10 max-h-40 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => {
                    setModel1(suggestion);
                    setSuggestions([]);
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Year 1 Input with Dropdown */}
        <div className="relative w-full">
          <input 
            type="text" 
            value={year1} 
            onChange={(e) => {
              setYear1(e.target.value);
              setActiveInput('year1');
            }}
            onFocus={() => setActiveInput('year1')}
            placeholder="Enter Car 1 Year" 
            className="w-full p-2 border rounded-md" 
          />
        </div>
      </div>

        {/* Car 2 Input */}
         {/* Car 2 Input */}
      <div className="box_with_shadow">
      <FontAwesomeIcon icon={faCarSide} size="3x" className="transform scale-x-[-1]" />
        <h2 className="subtitle">Car 2</h2>

        {/* Brand 2 Input with Dropdown */}
        <div className="relative w-full">
          <input 
            type="text" 
            value={make2} 
            onChange={(e) => {
              setBrand2(e.target.value);
              fetchSuggestions(e.target.value, 'make');
              setActiveInput('make2');
            }}
            onFocus={() => setActiveInput('make2')}
            onBlur={() => setTimeout(() => setSuggestions([]), 100)}
            placeholder="Enter Car 2 Make" 
            className="w-full p-2 border rounded-md mb-2" 
          />
          {activeInput === 'make2' && suggestions.length > 0 && (
            <ul className="absolute bg-white border rounded-md w-full z-10 max-h-40 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => {
                    setBrand2(suggestion);
                    setSuggestions([]);
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Model 2 Input with Dropdown */}
        <div className="relative w-full">
          <input 
            type="text" 
            value={model2} 
            onChange={(e) => {
              setModel2(e.target.value);
              fetchSuggestions(e.target.value, 'model');
              setActiveInput('model2');
            }}
            onFocus={() => setActiveInput('model2')}
            onBlur={() => setTimeout(() => setSuggestions([]), 100)}
            placeholder="Enter Car 2 Model" 
            className="w-full p-2 border rounded-md mb-2" 
          />
          {activeInput === 'model2' && suggestions.length > 0 && (
            <ul className="absolute bg-white border rounded-md w-full z-10 max-h-40 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => {
                    setModel2(suggestion);
                    setSuggestions([]);
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Year 2 Input with Dropdown */}
        <div className="relative w-full">
          <input 
            type="text" 
            value={year2} 
            onChange={(e) => {
              setYear2(e.target.value);
              setActiveInput('year2');
            }}
            onFocus={() => setActiveInput('year2')}
            placeholder="Enter Car 2 Year" 
            className="w-full p-2 border rounded-md" 
          />
        </div>
      </div>
    </div>

    <div className="flex flex-row gap-5 my-10 justify-between ml-20">
        <button 
          onClick={handleCompare} 
          className="general-button-styling"
        >
          Compare
        </button>

        <button 
          className="general-button-styling"
        >
          🪄 AI suggestion
        </button>

    </div>
        

      {/* Comparison Results */}
      {comparisonResult.length > 0 && (
        <div className="mt-5 w-full max-w-4xl">
          {comparisonResult}
        </div>
      )}
    </div>
  );
}

export default Compare;
