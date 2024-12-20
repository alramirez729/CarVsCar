import React, { useState, useEffect, useContext, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faCarSide } from '@fortawesome/free-solid-svg-icons';
import carMakes from './carMakes';
import { AuthContext } from '../AuthContext';



function Compare() {

  const [make1, setMake1] = useState('');
  const [model1, setModel1] = useState('');
  const [year1, setYear1] = useState('');
  const [make2, setMake2] = useState('');
  const [model2, setModel2] = useState('');
  const [year2, setYear2] = useState('');

  const [setMakeSuggestions] = useState([]);

  const [modelSuggestions1, setModelSuggestions1] = useState([]);
  const [yearSuggestions1, setYearSuggestions1] = useState([]);

  const [modelSuggestions2, setModelSuggestions2] = useState([]);
  const [yearSuggestions2, setYearSuggestions2] = useState([]);

  const [comparisonResult, setComparisonResult] = useState([]);

  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);


  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState(''); // New state for alert message
  const [alertType, setAlertType] = useState('info'); // Optional: for different alert styles

  const resultsRef = useRef(null);


  //alerts for button if input fields are incomplete/incorrect
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage('');
        setAlertType('info'); // Reset to default if using alertType
      }, 3000); // 3 seconds
  
      return () => clearTimeout(timer); // Cleanup on unmount or message change
    }
  }, [alertMessage]);


  //autoscroll when clicking the compare button
  useEffect(() => {
    if (comparisonResult.length > 0 && resultsRef.current) {
      const offset = -100; // Adjust this value to move the scroll position up
      const top = resultsRef.current.getBoundingClientRect().top + window.pageYOffset + offset;
  
      window.scrollTo({
        top: top,
        behavior: 'smooth', // Ensures smooth scrolling
      });
    }
  }, [comparisonResult]);
  
  


  // Function to fetch data for a given make, model, and year
  const fetchCarData = async (make, model, year) => {
    try {
      const response = await fetch(`http://localhost:3000/api/cars?limit=10make=${make}&model=${model}&year=${year}`);
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

  const fetchSuggestions = async (query = '', type, make = '', model = '', carNumber) => {
    if (!carNumber) {
      console.error('carNumber is missing. You must pass carNumber explicitly (1 or 2).');
      return;
    }
    try {
      let endpoint = `http://localhost:3000/api/cars?${type}=${query}`;
      if (type === 'model') {
        endpoint = `http://localhost:3000/api/cars?make=${make}`;
      }
      if (type === 'year') {
        endpoint = `http://localhost:3000/api/cars?make=${make}&model=${model}`;
      }
  
      console.log('Fetching suggestions from:', endpoint); // Debugging log
  
      const response = await fetch(endpoint);
      if (!response.ok) {
        console.error(`Error fetching ${type} suggestions: ${response.statusText}`);
        return;
      }
  
      const data = await response.json();
  
      // Update the correct suggestion state
      if (type === 'model') {
        if (carNumber === 1) {
          setModelSuggestions1((prev) => {
            console.log('Updating model suggestions for Car 1:', data);
            return [...new Set(data.map((car) => car.model))];
          });
        } else if (carNumber === 2) {
          setModelSuggestions2((prev) => {
            console.log('Updating model suggestions for Car 2:', data);
            return [...new Set(data.map((car) => car.model))];
          });
        }
      } else if (type === 'year') {
        if (carNumber === 1) {
          setYearSuggestions1([...new Set(data.map((car) => car.year))].sort((a, b) => b - a));
          console.log('Updating year suggestions for Car 1');
        } else if (carNumber === 2) {
          setYearSuggestions2([...new Set(data.map((car) => car.year))].sort((a, b) => b - a));
          console.log('Updating year suggestions for Car 2');
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type} suggestions:`, error);
    }
  };
  
  
  
  
  
  
  
  // Handle comparison
  const handleCompare = async () => {
    // Validate inputs for both cars
    if (!make1 || !model1 || !year1) {
      setAlertMessage('Please fill in all fields for Car 1.');
      setAlertType('error'); // Optional
      return;
    }
    if (!make2 || !model2 || !year2) {
      setAlertMessage('Please fill in all fields for Car 2.');
      setAlertType('error'); // Optional
      return;
    }
  
    // Fetch data for both cars
    try {
      const data1 = await fetchCarData(make1, model1, year1);
      const data2 = await fetchCarData(make2, model2, year2);
  
      if (data1.length === 0 || data2.length === 0) {
        setAlertMessage('Invalid car details. Please check your inputs.');
        setAlertType('error'); // Optional
        return;
      }
  
      generateComparison(data1, data2);
    } catch (error) {
      console.error('Error comparing cars:', error);
      setAlertMessage('An error occurred during comparison. Please try again.');
      setAlertType('error'); // Optional
    }
  };

  const handleAISuggestion = () => {
    setShowAlert(true); // Show alert
    setTimeout(() => setShowAlert(false), 3000); // Hide after 3 seconds
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
          <h3 className="text-xl font-bold font-mono">{metricLabel}</h3>
          <FontAwesomeIcon 
            icon={faQuestionCircle} 
            className="ml-2 text-blue-600 cursor-pointer " 
            onClick={toggleExplanation} 
          />
        </div>
        {explanationVisible && (
          <p className="text-sm text-gray-600 mb-3 font-mono">
            {metricExplanations[metric]}
          </p>
        )}
        {/* Car 1 and Car 2 Cards */}
        <div className="flex flex-row w-full gap-4">
          {/* Car 1 Card */}
          <div
            className={`animate-fade-in flex flex-col items-center p-4 rounded-lg shadow-md w-1/2 transition-colors duration-900 font-mono
              ${isCar1Better ? 'bg-green-200' : isCar2Better ? 'bg-red-200' : 'bg-white'}`}
          >
            <h4 className="font-semibold font-mono">Car 1: {car1.make} {car1.model} ({car1.year})</h4>
            <p className="mt-1">{car1.value + " " + getShortMetricLabel(metricLabel)}</p>
          </div>
          {/* Car 2 Card */}
          <div
            className={`animate-fade-in flex flex-col items-center p-4 rounded-lg shadow-md w-1/2 transition-colors duration-900 font-mono
              ${isCar2Better ? 'bg-green-200' : isCar1Better ? 'bg-red-200' : 'bg-white'}`}
          >
            <h4 className="font-semibold font-mono">Car 2: {car2.make} {car2.model} ({car2.year})</h4>
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
      <h1 className="heading tracking-widest ring-1 ring-slate-300 bg-slate-200 rounded-l h-30 w-30 border-b-gray-300 border-2 p-5">Car Comparison</h1>
      <h1 className="subheading">Select two vehicles to see how they compare.</h1>
  
      <div className="flex flex-col md:flex-row md:justify-between w-full max-w-4xl gap-5 my-10">
        {/* Car 1 Input */}
        <div className="box_with_shadow">
          <FontAwesomeIcon icon={faCarSide} size="3x" />
          <h2 className="title">Car 1</h2>

          {/* Make Dropdown */}
          <div className="relative w-full">
            <select
              value={make1}
              onChange={(e) => {
                setMake1(e.target.value);
                fetchSuggestions('', 'model', e.target.value, '', 1);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="" disabled>Select Car Make</option>
              {carMakes.map((make, index) => (
                <option key={index} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>

          {/* Model Dropdown */}
          <div className="relative w-full">
            <select
              value={model1}
              onChange={(e) => {
                const selectedModel = e.target.value;
                setModel1(selectedModel);  
                fetchSuggestions('', 'year', make1, selectedModel, 1);            
              }}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="" disabled>Select Car Model</option>
              {modelSuggestions1.map((model, index) => (
                <option key={index} value={model}>{model}</option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div className="relative w-full">
            <select
              value={year1}
              onChange={(e) => setYear1(e.target.value)}
              onFocus={() => {
              }}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="" disabled>Select Year</option>
              {yearSuggestions1.map((year, index) => (
                <option key={index + 1} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
  
        {/* Car 2 Input */}
        <div className="box_with_shadow">
          <FontAwesomeIcon icon={faCarSide} size="3x" className="transform scale-x-[-1]" />
          <h2 className="title">Car 2</h2>
  
          {/* Make 2 Input with Dropdown */}
          <div className="relative w-full">
            <select
              value={make2}
              onChange={(e) => {
                setMake2(e.target.value);
                fetchSuggestions('', 'model', e.target.value, '', 2); // Fetch models for the selected make
              }}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="" disabled>Select Car Make</option>
              {carMakes.map((make, index) => (
                <option key={index} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>
  
          {/* Model 2 Input with Dropdown */}
          <div className="relative w-full">
            <select
              value={model2}
              onChange={(e) => {
                setModel2(e.target.value)
                fetchSuggestions('', 'year', make2, e.target.value, 2);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="" disabled>Select Car Model</option>
              {modelSuggestions2.map((model, index) => (
                <option key={index} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
  
          {/* Year 2 Input */}
          <div className="relative w-full">
            <select
              value={year2}
              onChange={(e) => setYear2(e.target.value)}
              onFocus={() => {
                if (make2 && model2) {
                  fetchSuggestions('', 'year', make2, model2, 2); // Fetch years for selected make and model
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="" disabled>Select Year</option>
              {yearSuggestions2.map((year, index) => (
                <option key={index} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>
  
      <div className="flex flex-row gap-5 my-10 justify-center">
        <button onClick={handleCompare} className="general-button-styling">
          Compare
        </button>

        
  
        {isLoggedIn && (
        <button className="general-button-styling" onClick={handleAISuggestion}>
          🪄 AI suggestion
        </button>
      )}
  
        {/* Custom Alert */}
        {alertMessage && (
          <div
            className={`fixed -my-10 -ml-48 z-50 p-4 text-sm rounded-lg shadow-lg ${
              alertType === 'error'
                ? 'text-red-800 bg-red-50 dark:bg-gray-800 dark:text-red-400'
                : 'text-blue-800 bg-blue-50 dark:bg-gray-800 dark:text-blue-400'
            }`}
            role="alert"
          >
            <span className="font-medium">
              {alertType === 'error' ? 'Error!' : 'Info!'}
            </span>{' '}
            {alertMessage}
          </div>
        )}
        {showAlert && (
          <div
            className="p-4 -my-10 ml-32 fixed text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 shadow-lg"
            role="alert"
          >
            <span className="font-medium ">Sorry!</span> Still working on this feature :)
          </div>
        )}
      </div>
  
      {/* Comparison Results */}
      {comparisonResult.length > 0 && (
        <div ref={resultsRef} className="mt-5 w-full max-w-4xl">{comparisonResult}</div>
      )}
    </div>
  );
  
}

export default Compare;
