import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { faQuestionCircle, faTimes, faChevronLeft, faChevronRight, faList, faThLarge, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AuthContext } from '../AuthContext';
import { generatePDF } from "../components/generatePDF.js";
import { getAISuggestion } from '../components/getAISuggestion.js';
import html2pdf from "html2pdf.js";
import hardcodedCarMakes from "../constants/makes.js";
import SpeedometerGroup from '../components/SpeedometerGroup.js';
import carLogoLeft from "./images/CarCompareLeft.png";
import carLogoRight from "./images/CarCompareRight.png";
import RenderBarChart from '../components/RenderBarChart.js';
import metricExplanations from '../constants/metricsExplanation.js';


function Compare() {
  //use state for vehicles 
  const [carMakes, setCarMakes] = useState(hardcodedCarMakes);
  
  const [make1, setMake1] = useState('');
  const [model1, setModel1] = useState('');
  const [year1, setYear1] = useState('');
  const [make2, setMake2] = useState('');
  const [model2, setModel2] = useState('');
  const [year2, setYear2] = useState('');

  const [modelSuggestions1, setModelSuggestions1] = useState([]);
  const [yearSuggestions1, setYearSuggestions1] = useState([]);

  const [modelSuggestions2, setModelSuggestions2] = useState([]);
  const [yearSuggestions2, setYearSuggestions2] = useState([]);

  const [comparisonResult, setComparisonResult] = useState([]);
  const [nonNumericalComparison, setNonNumericalComparison] = useState(null);
  
  const [carLogo1, setCarLogo1] = useState(null);  
  const [carLogo2, setCarLogo2] = useState(null);  

  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiBox, setShowAiBox] = useState(false);

  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info'); 
  
  const resultsRef = useRef(null);
  
  const [fuelEfficiency1, setFuelEfficiency1] = useState(0);
  const [power1, setPower1] = useState(0);
  const [overallRating1, setOverallRating1] = useState(0);
  
  const [fuelEfficiency2, setFuelEfficiency2] = useState(0);
  const [power2, setPower2] = useState(0);
  const [overallRating2, setOverallRating2] = useState(0);
  const [comparisonData, setComparisonData] = useState([]);
  
  const [viewMode, setViewMode] = useState('list'); 
  const [activeTab, setActiveTab] = useState(0);
  const sections = ['Overall Ratings', 'Car Features', 'Performance Charts'];

  const [hasCompared, setHasCompared] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  
  const handleNextTab = () => {
    setActiveTab((prev) => (prev + 1) % sections.length);
  };
  
  const handlePrevTab = () => {
    setActiveTab((prev) => (prev - 1 + sections.length) % sections.length);
  };
  
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

  //Speedometer
  useEffect(() => {
    if (comparisonData.length === 2) {
      const car1 = comparisonData[0];
      const car2 = comparisonData[1];
  
      const maxMpg = 50; // Maximum MPG for scaling
      const maxCylinders = 16; // Maximum cylinders for scaling
  
      // Weights for metrics
      const weightFuelEfficiency = 1.2;
      const weightPower = 0.3;
  
      // Calculate normalized scores
      const calculateFuelEfficiencyScore = (mpg) => (Math.min((mpg / maxMpg) * 100, 100));
      const calculatePowerScore = (cylinders) => Math.min((cylinders / maxCylinders) * 100, 100);
  
      // Calculate overall rating
      const calculateOverallRating = (fuelEfficiency, power) => {
        const fuelEfficiencyScore = calculateFuelEfficiencyScore(fuelEfficiency * 2) ;
        const powerScore = calculatePowerScore(power);
  
        return Math.round(
          (fuelEfficiencyScore * weightFuelEfficiency + powerScore * weightPower) /
            (weightFuelEfficiency + weightPower)
        );
      };
  
      // Update speedometer values
      setFuelEfficiency1(car1?.combination_mpg || 0);
      setFuelEfficiency2(car2?.combination_mpg || 0);
  
      setPower1(car1?.cylinders || 0);
      setPower2(car2?.cylinders || 0);
  
      setOverallRating1(
        calculateOverallRating(car1?.combination_mpg || 0, car1?.cylinders || 0)
      );
      setOverallRating2(
        calculateOverallRating(car2?.combination_mpg || 0, car2?.cylinders || 0)
      );
    }
  }, [comparisonData]);

  //autoscroll when clicking the compare button
  useEffect(() => {
    if (comparisonResult && comparisonResult.length  > 0 && resultsRef.current) {
      const timeout = setTimeout(() => {
        const offset = -2000; // Adjust this value to move the scroll position up
        const top = resultsRef.current.getBoundingClientRect().top + window.pageYOffset + offset;
    
        window.scrollTo({
          top: top,
          behavior: 'smooth', // Ensures smooth scrolling
        });
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [comparisonResult]);
  
  // Function to fetch data for a given make, model, and year
  const fetchCarData = async (make, model, year) => {
    try {
        const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/cars?make=${make}&model=${encodeURIComponent(model)}&year=${year}&limit=75`
        );
        if (response.ok) {
            const data = await response.json(); 
            if(data.length === 0){
              alert('No data available for  ${make} ${mode} (${year}). Please select another model.');
              return[];
            }
            return data;
        } else {
            console.error('Error fetching car data:', await response.text());
            return [];
        }
    } catch (error) {
        console.error('Error fetching car data:', error);
        return [];
    }
};

// Cache for storing year data for models
const yearDataCache = new Map();

// Helpers for TTL-based cache
const getWithExpiry = (key) => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  try {
    const { value, expiry } = JSON.parse(cached);
    if (Date.now() > expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return value;
  } catch (err) {
    return null;
  }
};

const setWithExpiry = (key, value, ttl = 86400000) => {
  const data = {
    value,
    expiry: Date.now() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(data));
};

const fetchSuggestions = async (type, make = '', model = '', carNumber) => {
  if (!carNumber) {
    console.error('carNumber is missing. You must pass carNumber explicitly (1 or 2).');
    return;
  }

  try {
    if (type === 'model') {
      if (!make) {
        console.error('Make is required for fetching models.');
        return;
      }

      const cacheKey = `models-with-years-${make}`;
      const cachedModels = getWithExpiry(cacheKey);
      if (cachedModels) {
        if (carNumber === 1) setModelSuggestions1(cachedModels);
        else setModelSuggestions2(cachedModels);
        return;
      }

      // Fetch all cars for this make in one go
      const bulkRes = await fetch(`${process.env.REACT_APP_API_URL}/api/cars?make=${make}&limit=1000`);

      if (!bulkRes.ok) {
        console.error(`Failed to fetch car data for ${make}`);
        return;
      }

      const carData = await bulkRes.json();

      // Group by model and ensure they have year data
      const modelMap = new Map();
      carData.forEach(car => {
        if (!modelMap.has(car.model)) {
          modelMap.set(car.model, new Set());
        }
        modelMap.get(car.model).add(car.year);
      });

      const validModels = Array.from(modelMap.entries())
        .filter(([_, years]) => years.size > 0)
        .map(([model]) => model)
        .sort();

      setWithExpiry(cacheKey, validModels); // cache for 24h

      if (carNumber === 1) {
        setModelSuggestions1(validModels);
      } else {
        setModelSuggestions2(validModels);
      }

    } else if (type === 'year') {
      if (!make || !model) {
        console.error('Make and Model are required for fetching years.');
        return;
      }

      const endpoint = `${process.env.REACT_APP_API_URL}/api/cars?make=${make}&model=${encodeURIComponent(model)}&limit=100`;

      if (carNumber === 1) {
        setYearSuggestions1([]);
        setYear1('');
      } else if (carNumber === 2) {
        setYearSuggestions2([]);
        setYear2('');
      }

      const response = await fetch(endpoint);

      if (!response.ok) {
        console.error(`Error fetching year suggestions: ${response.statusText}`);
        return;
      }

      const data = await response.json();
      const years = [...new Set(data.map(car => car.year))].sort((a, b) => b - a);

      if (years.length === 0) {
        setAlertMessage(`No year data available for ${make} ${model}. Please select another model.`);
        setAlertType('error');

        if (carNumber === 1) setYearSuggestions1(['No available years']);
        else setYearSuggestions2(['No available years']);
        return;
      }

      if (carNumber === 1) setYearSuggestions1(years);
      else setYearSuggestions2(years);
    } else {
      console.error(`Invalid type: ${type}`);
    }
  } catch (error) {
    console.error(`Error fetching ${type} suggestions for Car ${carNumber}:`, error);
  }
};

  const fetchCarLogo = async (make, setLogoState) => {
    try {
      const slug = make.toLowerCase().replace(/ /g, "-"); // Convert make into a slug
      const logoUrl = `https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/${slug}.png`;
      const response = await fetch(logoUrl);
      if (response.ok) {
        setLogoState(logoUrl); 
      } else {
        setLogoState(null); // If not found, fallback to default
      }
    } catch (error) {
        console.error('Error fetching car logo:', error);
        setLogoState(null);
    }
};

  useEffect(() => {
    if (make1) fetchCarLogo(make1, setCarLogo1);
  }, [make1]);

  useEffect(() => {
    if (make2) fetchCarLogo(make2, setCarLogo2);
  }, [make2]);

  //Reset comparison
  const resetComparison = () => {
    setMake1('');
    setModel1('');
    setYear1('');
    setModelSuggestions1([]);
    setYearSuggestions1([]);
    setCarLogo1(null);
  
    setMake2('');
    setModel2('');
    setYear2('');
    setModelSuggestions2([]);
    setYearSuggestions2([]);
    setCarLogo2(null);
  
    setComparisonResult([]);
    setNonNumericalComparison(null);
    setComparisonData([]);
    setFuelEfficiency1(0);
    setFuelEfficiency2(0);
    setPower1(0);
    setPower2(0);
    setOverallRating1(0);
    setOverallRating2(0);
    setHasCompared(false);
    setAiSuggestion('');
    setShowAiBox(false);
  };

  //Resetting individual boxes: 
  const resetCar1 = () => {
    setMake1('');
    setModel1('');
    setYear1('');
    setModelSuggestions1([]);
    setYearSuggestions1([]);
    setCarLogo1(null);
  };
  
  const resetCar2 = () => {
    setMake2('');
    setModel2('');
    setYear2('');
    setModelSuggestions2([]);
    setYearSuggestions2([]);
    setCarLogo2(null);
  };
  
  // Save comparison using PDF
  const saveComparison = async (car1, car2) => {
    const element = document.getElementById("report-section");
  
    if (!element) return alert("No comparison to save.");
  
    try {
      const pdf_options = {
        margin: 10,
        filename: `CarComparison-${Date.now()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };
  
      // Generate PDF blob using the same settings
      const pdfBlob = await html2pdf().from(element).set(pdf_options).outputPdf('blob');


      const file = new File([pdfBlob], pdf_options.filename, { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('pdf', file); // <— this is the important change
      formData.append('car1', `${car1.make} ${car1.model}`);
      formData.append('car2', `${car2.make} ${car2.model}`);

  
      const token = localStorage.getItem('token');
  
      const res = await fetch(`${process.env.REACT_APP_API_URL}/compare/save-comparison`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setShowConfirmationModal(true);
      } else {
        console.error(data.error);
        alert('Failed to save comparison.');
      }
    } catch (err) {
      console.error('Error saving comparison:', err);
      alert('An error occurred while saving.');
    }
  };
  

  //Box above the graphs
  const generateNonNumericalComparison = (data1, data2) => {
    const nonNumericalMetrics = ["class", "transmission", "drive", "fuel_type"];
    const labels = {
      class: "Form-Factor",
      transmission: "Transmission",
      drive: "Drive Type",
      fuel_type: "Engine"  
    };

    const formatTransmission = (value) => {
      return value === 'm' ? "Manual" : value === 'a' ? "Automatic" : value;
    };

    const formatEngine = (fuel, cylinders, displacement) => {
      const fuelFormatted = fuel?.charAt(0).toUpperCase() + fuel?.slice(1) || 'Uknown';
      const cylindersFormatted = cylinders ? `${cylinders} cylinder` : 'n/a cyl.';
      const displacementFormatted = displacement ? `${displacement}L` : 'n/a size';

      return `${fuelFormatted}, ${cylindersFormatted}, ${displacementFormatted}`;
    }

    const formatDriveType = (value) => {
      const driveMap = {
          'fwd': 'Front-wheel drive',
          'rwd': 'Rear-wheel drive',
          'awd': 'All-wheel drive',
          '4wd': 'Four-wheel drive'
      };
      return driveMap[value] || value;
    };

    const isEngineString = (value) =>{
      return typeof value === 'string' && /cylinder/i.test(value) && /L/.test(value);
    }

    return (
      <div className="flex flex-col items-center px-3 py-4 sm:p-6 bg-gradient-to-br from-blue-100 to-gray-50 
                  rounded-lg shadow-md border border-gray-200 sm:col-1
                  w-full max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto my-6 sm:my-10 overflow-hidden">
        
        {/* Title */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 flex-wrap text-center">
          {carLogo1 && (
            <img
              src={carLogo1}
              alt={`${make1} logo`}
              className="h-8 sm:h-10 w-auto object-contain"
            />
          )}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-700 font-mono text-center">
            Car Feature Overview
          </h2>
          {carLogo2 && (
            <img
              src={carLogo2}
              alt={`${make2} logo`}
              className="h-8 sm:h-10 w-auto object-contain"
            />
          )}
        </div>
    
        {/* Header Row */}
        <div className="grid grid-cols-3 w-full bg-blue-300 py-2 rounded-t-lg text-center font-semibold text-gray-700 text-sm sm:text-base px-2 sm:px-4">
          <p className="font-bold font-mono italic text-left">Spec.</p>
          <p className="font-bold font-mono italic text-left truncate">{make1}:</p>
          <p className="font-bold font-mono italic text-left truncate">{make2}:</p>
        </div>
    
        {nonNumericalMetrics.map((metric, index) => {
          let car1Value, car2Value;
    
          if (metric === 'fuel_type') {
            car1Value = formatEngine(data1[0].fuel_type, data1[0].cylinders, data1[0].displacement);
            car2Value = formatEngine(data2[0].fuel_type, data2[0].cylinders, data2[0].displacement);
          } else if (metric === 'transmission') {
            car1Value = formatTransmission(data1[0][metric]);
            car2Value = formatTransmission(data2[0][metric]);
          } else if (metric === 'drive') {
            car1Value = formatDriveType(data1[0][metric]);
            car2Value = formatDriveType(data2[0][metric]);
          } else {
            car1Value = data1[0][metric].toUpperCase();
            car2Value = data2[0][metric].toUpperCase();
          }
    
          return (
            <div
              key={metric}
              className={`grid grid-cols-3 w-full py-2 px-2 sm:px-4 text-left items-start
                ${index % 2 === 0 ? 'bg-blue-200' : 'bg-blue-100'}
                border-b border-gray-300 text-sm sm:text-base`}
            >
              <p className="font-mono font-medium text-gray-800 break-words">{labels[metric]}</p>
              <p className={`font-mono font-semibold break-words ${isEngineString(car1Value) ? 'text-purple-700' : 'text-gray-700'}`}>{car1Value}</p>
              <p className={`font-mono font-semibold break-words ${isEngineString(car2Value) ? 'text-purple-700' : 'text-gray-700'}`}>{car2Value}</p>
            </div>
          );
        })}
      </div>
    );
  };

  // Handle comparison
  const handleCompare = async () => {
    // Validate inputs for both cars
    if (!make1 || !model1 || !year1) {
      console.log("❌ Missing Car 1 details! Triggering alert.");
      setAlertMessage('Please fill in all fields for Car 1.');
      setAlertType('error');
      return;
    }
    if (!make2 || !model2 || !year2) {
      console.log("❌ Missing Car 2 details! Triggering alert.");
      setAlertMessage('Please fill in all fields for Car 2.');
      setAlertType('error');
      return;
    }
  
    // Fetch data for both cars
    try {
      const data1 = await fetchCarData(make1, model1, year1);
      const data2 = await fetchCarData(make2, model2, year2);
  
      if (data1.length === 0 || data2.length === 0) {
        setAlertMessage('Invalid car details. Please check your inputs.');
        setAlertType('error');
        return;
      }

      setComparisonData([data1[0], data2[0]]);

      // Generate comparisons
      setComparisonResult(generateComparison(data1, data2)); // Numerical
      setNonNumericalComparison(generateNonNumericalComparison(data1, data2)); // Non-Numerical
      console.log('Comparison Result:', comparisonResult);

      setHasCompared(true);
    } catch (error) {
      console.error('Error comparing cars:', error);
      setAlertMessage('An error occurred during comparison. Please try again.');
      setAlertType('error');
    }
  };

  // User Preferences
  async function fetchUserPreferences() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found. User is not authenticated.");
        return null;
      }

      console.log("Sending request to fetch user preferences...");

      const response = await fetch('https://car-vs-car-api.onrender.com/users/preferences', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Read raw text response for debugging
      const textResponse = await response.text();

      // Try parsing JSON manually
      const data = JSON.parse(textResponse);
      console.log("Fetched Preferences:", data);

      return data.preferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }
  
  const handleAISuggestion = async() => {
    setAiSuggestion('');
    setShowAiBox(true);
    setAiLoading(true);

    try{
      const suggestion = await getAISuggestion({
        make1, 
        model1,
        year1,
        make2,
        model2, 
        year2, 
        fetchCarData,
        fetchUserPreferences,
      });

      displayTextCharacterByCharacter(suggestion);

    }catch (error){
      console.error("AI suggestion Error", error);
      setAiSuggestion(error.message || "Failed to get AI response.");
    } finally {
      setAiLoading(false);
    }
  }

  // Function to display text character by character
  const displayTextCharacterByCharacter = (text) => {
    let index = 0;
    setAiSuggestion('');
    const interval = setInterval(() => {
      if (index < text.length) {
        setAiSuggestion((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval); // Ensure we stop when we reach the end of the text
      }
    }, 10); // Adjust speed (lower is faster)
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
  
    // Only returns the component array instead of modifying state directly
    return metrics.map((metric) => {
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
    const toggleExplanation = () => setExplanationVisible(!explanationVisible);
  
    // Utility to get the shortened metric label
    const getShortMetricLabel = (metricLabel) => {
      const words = metricLabel.split(" ");
      return words.slice(1).join(" ") || metricLabel;
    };
    // ✅ Bar Chart method
  return (
    <div className="flex flex-col h-full p-1 gap-1 bg-gray-100 rounded-md shadow-sm">
      {/* Metric Label and Explanation */}
      <div className="flex items-center justify-between w-full mb-2">
      <h3 className="w-full text-xl text-center font-semibold font-sans">{metricLabel}</h3>
      <FontAwesomeIcon 
          icon={faQuestionCircle} 
          className="ml-2 text-blue-600 cursor-pointer transition-transform duration-200 hover:scale-110"           
          onClick={toggleExplanation} 
        />
      </div>

      {/* Explanation Toggle */}
      {explanationVisible && (
        <p className="text-sm text-gray-600 mb-3 font-mono">
          {metricExplanations[metric]}
        </p>
      )}

      {/* Car 1 and Car 2 Cards */}
      <div className="flex flex-row w-full">
        {/* Car 1 Box */}
        <div className={"p-2 w-1/2 rounded-md shadow-sm text-xs font-mono bg-sky-200"}>
          <h4 className="text-sm">{car1.make} - {car1.model} ({car1.year})</h4>
        </div>

        {/* Car 2 Box */}
        <div className="p-2 w-1/2 rounded-md shadow-sm text-xs font-mono bg-fuchsia-300">
        <h4 className="text-sm">{car2.make} - {car2.model} ({car2.year})</h4>
        </div>
      </div>

      {/* Bar Chart Appears Below the Metric Row (Centered) */}
      <div className="flex justify-center items-center mt-2">
        <RenderBarChart
          metricLabel={metricLabel}
          car1={car1}
          car2={car2}
        />
      </div>
      </div>
  );
};

  return (
    <div className="flex flex-col items-center justify-center w-full my-min-h-screen p-10 bg-white">
      <h1 className="heading tracking-widest ring-1 ring-slate-300 bg-slate-200 rounded-l h-30 w-30 border-b-gray-300 border-2 p-5 animate-fade-in-up animation-delay-1000">Car Comparison</h1>
      <h1 className="subheading animate-fade-in-up animation-delay-1000">Select two vehicles to see how they compare.</h1>
      <div className="w-full flex flex-row space-x-4 my-4 justify-end">
        <button
        className={`animate-fade-in inline-flex items-center space-x-2 text-blue font-sans py-2 px-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'bg-gray-300 text-black'}`}
        onClick={() => setViewMode('list')}
      >
        <FontAwesomeIcon icon={faList} className="w-4 h-4" /> {/* List View Icon */}
        <span>List View</span>
      </button>
      <button
        className={`animate-fade-in inline-flex items-center space-x-2 text-blue font-sans py-2 px-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg ${viewMode === 'tab' ? 'bg-cyan-500 text-white' : 'bg-gray-300 text-black'}`}
        onClick={() => setViewMode('tab')}
      >
        <FontAwesomeIcon icon={faThLarge} className="w-4 h-4" /> {/* Tab View Icon */}
        <span>Tab View</span>
      </button>
      </div>
      <div className="animate-fade-in flex flex-col md:flex-row md:justify-between w-full max-w-8xl gap-5 -my-0">
        {/* Car 1 Input */}
        <div className="flex flex-col items-center ring-8 ring-sky-100 shadow-xl p-5 rounded-lg w-full">
        <div className="relative w-full">
          <button
            onClick={resetCar1}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition transform hover:scale-110"
            title="Reset Car 1"
          >
            🔄
          </button>
        </div>
        <div className="w-36 min-h-36 flex items-center justify-center">
            {carLogo1 ? (
                <img 
                    src={carLogo1} 
                    alt="Car 1 Logo" 
                    className="w-36 h-36 object-contain mx-auto hover:scale-125 transition-transform"
                />
            ) : (
                <img src={carLogoRight} size="5x" />
            )}
        </div>
          <h2 className="title">
            {make1 
              ? model1 
                ? `${make1.charAt(0).toUpperCase() + make1.slice(1)} - ${model1.charAt(0).toUpperCase() + model1.slice(1)}` // If both make and model are selected
                : make1                // If only make is selected
              : "Car 1"                // Default when neither make nor model is selected
            }
          </h2>

          {/* Make Dropdown */}
          <div className="relative w-full">
            <h1 className="font-thin italic font-sans">Select vehicle make:</h1>
            <select
              value={make1}
              onChange={(e) => {
                setMake1(e.target.value);
                fetchSuggestions('model', e.target.value, '', 1);
              }}
              className="dropdown_input_styling"
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
          <h1 className="font-thin italic font-sans">Select vehicle model:</h1>
            <select
              value={model1}
              onChange={(e) => {
                const selectedModel = e.target.value;
                setModel1(selectedModel);  
                fetchSuggestions('year', make1, selectedModel, 1);            
              }}
              className="dropdown_input_styling"
            >
              <option value="" disabled>Select Car Model</option>
              {modelSuggestions1.map((model, index) => (
                <option key={index} value={model}>{model}</option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div className="relative w-full">
          <h1 className="font-thin italic font-sans">Select vehicle year:</h1>
          <select
            value={year1}
            onChange={(e) => setYear1(e.target.value)}
            onFocus={() => {
              if (make1 && model1) {
                fetchSuggestions('year', make1, model1, 1);
              }
            }}
            className="dropdown_input_styling"
            disabled={yearSuggestions1.length === 1 && yearSuggestions1[0] === "No available years"}
          >
            <option value="" disabled>{yearSuggestions1[0] === "No available years" ? "No years available" : "Select Year"}</option>
            {yearSuggestions1[0] !== "No available years" &&
              yearSuggestions1.map((year, index) => (
                <option key={index} value={year}>
                  {year}
                </option>
              ))
            }
            </select>
          </div>
        </div>
  
        {/* Car 2 Input */}
        <div className="animate-fade-in flex flex-col items-center ring-8 ring-fuchsia-100 shadow-xl p-5 rounded-lg w-full">
        <div className="relative w-full">
          <button
            onClick={resetCar2}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition transform hover:scale-110"
            title="Reset Car 2"
          >
            🔄
          </button>
        </div>
        <div className="w-36 min-h-36 flex items-center justify-center ">
            {carLogo2 ? (
                <img 
                    src={carLogo2} 
                    alt="Car 1 Logo" 
                    className="w-36 h-36 object-contain mx-auto hover:scale-125 transition-transform "
                />
            ) : (
                <img src={carLogoLeft} size="5x" />
            )}
        </div>
          <h2 className="title">
            {make2 
              ? model2 
                ? `${make2.charAt(0).toUpperCase() + make2.slice(1)} - ${model2.charAt(0).toUpperCase() + model2.slice(1)}` // If both make and model are selected
                : make2                // If only make is selected
              : "Car 2"                // Default when neither make nor model is selected
            }
          </h2>
  
          {/* Make 2 Input with Dropdown */}
          <div className="relative w-full">
          <h1 className="font-thin italic font-sans">Select vehicle make:</h1>
            <select
              value={make2}
              onChange={(e) => {
                setMake2(e.target.value);
                fetchSuggestions('model', e.target.value, '', 2); // Fetch models for the selected make
              }}
              className="dropdown_input_styling"
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
          <h1 className="font-thin italic font-sans">Select vehicle model:</h1>
            <select
              value={model2}
              onChange={(e) => {
                setModel2(e.target.value)
                fetchSuggestions('year', make2, e.target.value, 2);
              }}
              className="dropdown_input_styling"
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
          <h1 className="font-thin italic font-sans">Select vehicle year:</h1>
          <select
            value={year2}
            onChange={(e) => setYear2(e.target.value)}
            onFocus={() => {
              if (make2 && model2) {
                fetchSuggestions('year', make2, model2, 2);
              }
            }}
            className="dropdown_input_styling"
            disabled={yearSuggestions2.length === 1 && yearSuggestions2[0] === "No available years"}
          >
            <option value="" disabled>{yearSuggestions2[0] === "No available years" ? "No years available" : "Select Year"}</option>
            {yearSuggestions2[0] !== "No available years" &&
              yearSuggestions2.map((year, index) => (
                <option key={index} value={year}>
                  {year}
                </option>
              ))
            }
            </select>
          </div>

        </div>
      </div>
      {hasCompared &&(
        <div className="w-full flex flex-col text-xs sm:flex-row sm:justify-end sm:items-center gap-2 mt-4">
        <button 
        onClick={() => generatePDF("report-section")}
        className="compare-control-button-primary">
          <FontAwesomeIcon icon={faFilePdf} className="mr-2" /> Download as PDF
        </button>
        
        <button onClick={resetComparison} className="compare-control-button-secondary">
          🔄 Reset Comparison
        </button>
        </div>
      )}
      <div className="flex flex-row my-0 justify-center -mr-24 space-x-0">
        <button 
        onClick={handleCompare} 
        className="compare-page-buttons"
        >
          Compare
        </button>
        {isLoggedIn && (
        <button className="compare-page-buttons" 
        onClick={handleAISuggestion}>
          🪄AI suggestion
        </button>
      )}
      </div>
      

      {isLoggedIn && hasCompared && (
        <button 
        onClick={() => saveComparison({ make: make1, model: model1 }, { make: make2, model: model2 })}
        className="save-comparison-button">
          💾 Add to Saved Comparisons
        </button>
      )}

      
      <div id="report-section" className="flex flex-col items-center w-full">
      {/* AI Suggestion Box */}
      {showAiBox && (
        <div className="mt-6 p-4 w-full max-w-2xl bg-gray-100 rounded-lg shadow-lg relative">
          {/* Close Button */}
          <button 
            onClick={() => setShowAiBox(prev => !prev)} 
            className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>

          {/* AI Text Display */}
          <div className="text-gray-800 text-lg whitespace-pre-wrap font-mono">
            {aiLoading ? (
              <div className="animate-pulse">Thinking...</div>
            ) : (
              aiSuggestion || "No suggestion available."
            )}
          </div>
        </div>
      )}
      {/* Toggle Button for View Mode */}
  
        {/* Custom Alert */}
          {alertMessage && (
            <div
              className={`left-1/2 transform -translate-x-1/2 z-50 p-4 text-sm rounded-lg shadow-lg 
                ${alertType === 'error' ? 'text-red-800 bg-red-50' : 'text-blue-800 bg-blue-50'}`}
              role="alert"
            >
              <span className="font-medium">
                {alertType === 'error' ? 'Error!' : 'Info!'}
              </span>{' '}
              {alertMessage}
            </div>
          )}
          {showConfirmationModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg text-center w-96">
              <div className="flex justify-between items-center mb-4 px-4">
              <div className="compare-view-toggle">
                <button
                  onClick={() => setViewMode('list')}
                  className={`compare-view-toggle-button ${viewMode === 'list' ? 'compare-view-toggle-button-active' : 'compare-view-toggle-button-inactive'}`}
                >
                  <FontAwesomeIcon icon={faList} className="mr-1" /> List
                </button>
                <button
                  onClick={() => setViewMode('tab')}
                  className={`compare-view-toggle-button ${viewMode === 'tab' ? 'compare-view-toggle-button-active' : 'compare-view-toggle-button-inactive'}`}
                >
                  <FontAwesomeIcon icon={faThLarge} className="mr-1" /> Tabs
                </button>
              </div>
          </div>
          </div>
          </div>
          )

          }


      {viewMode === 'list' ? (
        <>
        {hasCompared &&(
          <>
          {/* Non-Numerical Comparison Box */}
          {nonNumericalComparison && nonNumericalComparison}
          {/* Numerical Comparison Results */}
          <div className="flex flex-col col-2 sm:col-1 sm:flex-row justify-between gap-12 md:gap-8 sm:gap-4 my-10 items-center">
            {/* Car 1 Speedometer */}
            <div className="flex flex-col items-center">
            <SpeedometerGroup
                title="Car 1"
                overallRating={overallRating1}
                fuelEfficiency={fuelEfficiency1}
                power={power1}
                make={make1}
                vehicleNumber={1}
              />
            </div>

            {/* Car 2 Speedometer */}
            <div className="flex flex-col items-center">
            <SpeedometerGroup
              title="Car 2"
              overallRating={overallRating2}
              fuelEfficiency={fuelEfficiency2}
              power={power2}
              make={make2}
              vehicleNumber={2}
            />
            </div>
          </div>
          </>
        )}
          <div ref={resultsRef} 
              className="flex flex-wrap justify-center gap-4 w-full"          
          >
            {comparisonResult.length > 0 ? (
              comparisonResult.map((metricComponent, index) => (
                <div key={index} className="w-full sm:w-[48%] lg:w-[32%] max-w-[341px]">
                  <div >{metricComponent}</div>
                </div>
              ))
            ) : (
              <p className="my-10 font-sans text-lg italic flex justify-center items-center">After selecting both car details, the results will appear below!</p>
            )}
          </div>
            </>
          ) : (
          <>
            {/* Tab View */}
            <div className="w-full flex flex-col items-center">
              <h2 className="my-10 text-2xl font-bold mb-4">{sections[activeTab]}</h2>

              <div className="flex flex-row items-center w-full max-w-4xl">
                {/* Left Arrow */}
                <button onClick={handlePrevTab} className="compare-nav-button">
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                {/* Tab Content */}
                <div className="w-full flex justify-center">
                {activeTab === 0 && (
                    <>
                      <div className="flex justify-between w-full">
                        <SpeedometerGroup
                          title="Car 1"
                          overallRating={overallRating1}
                          fuelEfficiency={fuelEfficiency1}
                          power={power1}
                          make={make1}
                          vehicleNumber={1}
                        />
                        <SpeedometerGroup
                          title="Car 2"
                          overallRating={overallRating2}
                          fuelEfficiency={fuelEfficiency2}
                          power={power2}
                          make={make2}
                          vehicleNumber={2}
                        />
                      </div>
                    </>
                  )}
                  {activeTab === 1 && (
                    <div className="w-full flex flex-col items-center">
                      {/* Ensure nonNumericalComparison remains large */}
                      <div className="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
                        {nonNumericalComparison}
                      </div>
                    </div>
                  )}

                  {activeTab === 2 && (
                    <>
  <div className={`grid gap-4 w-full items-center ${comparisonResult.length === 1 ? "grid-cols-1 justify-center place-items-center" : "grid-cols-2 lg:grid-cols-2 md:grid-cols-1"}`}>                        {comparisonResult.map((metricComponent, index) => (
                          <div key={index} className="flex flex-row items-center">
                            {metricComponent}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Right Arrow */}
                <button onClick={handleNextTab} className="compare-nav-button">
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
          </>
          
        )}
        
</div>
</div>
);
}

export default Compare;
