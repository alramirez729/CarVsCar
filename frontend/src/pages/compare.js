import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { faQuestionCircle, faTimes, faChevronLeft, faChevronRight, faList, faThLarge, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AuthContext } from '../AuthContext';
import html2pdf from "html2pdf.js";

//Components created 
import { getAISuggestion } from '../components/getAISuggestion.js';
import { generatePDF } from "../components/generatePDF.js";
import hardcodedCarMakes from "../constants/makes.js";
import ComparisonResults from '../components/ComparisonResults.js';
import CarInputCard from '../components/CarInputCard.js';
import RenderBarChart from '../components/RenderBarChart.js';
import metricExplanations from '../constants/metricsExplanation.js';
import AISuggestionBox from '../components/AISuggestionBox.js';
import { calculateOverallRating, extractSpeedometerValues } from '../utils/compareUtils';



function Compare() {
  //use state for vehicles 
  const location = useLocation();
  const vehiclesFromSearch = location.state?.vehicles;
  const [comparisonTriggered, setComparisonTriggered] = useState(false);

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

  // for passing in values from searchVehicles.js queue
  useEffect(() => {
    if (vehiclesFromSearch && vehiclesFromSearch.length === 2) {
      const [car1, car2] = vehiclesFromSearch;
      setMake1(car1.make);
      setModel1(car1.model);
      setYear1(car1.year);
      setMake2(car2.make);
      setModel2(car2.model);
      setYear2(car2.year);
      setComparisonTriggered(true);
      
      fetchSuggestions('model', car1.make, '', 1).then(() => {
        fetchSuggestions('year', car1.make, car1.model, 1);
      });
  
      fetchSuggestions('model', car2.make, '', 2).then(() => {
        fetchSuggestions('year', car2.make, car2.model, 2);
      });
    }

    
  }, [vehiclesFromSearch]);

  // helper effect for other edge cases not using searchVehicles.js
  useEffect(() => {
    if (comparisonTriggered && make1 && model1 && year1 && make2 && model2 && year2) {
      handleCompare();
      setComparisonTriggered(false);
    }
  }, [comparisonTriggered, make1, model1, year1, make2, model2, year2]);

  
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
  
      const values1 = extractSpeedometerValues(car1);
      const values2 = extractSpeedometerValues(car2);
  
      setFuelEfficiency1(values1.fuelEfficiency);
      setPower1(values1.power);
      setOverallRating1(values1.overallRating);
  
      setFuelEfficiency2(values2.fuelEfficiency);
      setPower2(values2.power);
      setOverallRating2(values2.overallRating);
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
  
    if (!element) {
      alert("No comparison to save.");
      return;
    }
  
    try {
      const pdf_options = {
        margin: 10,
        filename: `CarComparison-${Date.now()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };
  
      const worker = html2pdf()
        .from(element)
        .set(pdf_options);
  
      await worker.toPdf(); // <-- Needed step!
      const pdfBlob = await worker.output('blob'); // <-- Correct
  
      const file = new File([pdfBlob], pdf_options.filename, { type: 'application/pdf' });
  
      const formData = new FormData();
      formData.append('pdf', file);
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
      {/* View Mode Selector */}
      <div className="flex flex-col place-items-end w-full max-w-32 ml-auto mr-4 mb-4">
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="dropdown_input_styling text-sm"
        >
          <option value="list">List View</option>
          <option value="tab">Tab View</option>
        </select>
      </div>
      <div className="animate-fade-in flex flex-col md:flex-row md:justify-between w-full max-w-8xl gap-5 -my-0">
      <CarInputCard
          carNumber={1}
          make={make1}
          setMake={setMake1}
          model={model1}
          setModel={setModel1}
          year={year1}
          setYear={setYear1}
          carMakes={carMakes}
          modelSuggestions={modelSuggestions1}
          yearSuggestions={yearSuggestions1}
          carLogo={carLogo1}
          resetCar={resetCar1}
          fetchSuggestions={fetchSuggestions}
        />

        <CarInputCard
          carNumber={2}
          make={make2}
          setMake={setMake2}
          model={model2}
          setModel={setModel2}
          year={year2}
          setYear={setYear2}
          carMakes={carMakes}
          modelSuggestions={modelSuggestions2}
          yearSuggestions={yearSuggestions2}
          carLogo={carLogo2}
          resetCar={resetCar2}
          fetchSuggestions={fetchSuggestions}
        />

      </div>
      {hasCompared &&(
        <div className="w-full flex flex-col text-xs sm:flex-row sm:justify-end sm:items-center gap-2 mt-4">
        <button 
          onClick={() => generatePDF("report-section")}
          className="compare-control-button-primary p-2 ">
          <FontAwesomeIcon icon={faFilePdf} className="mr-2" /> Download as PDF  
        </button>
        <button onClick={resetComparison} className="compare-control-button-secondary p-4">
          🔄 Reset Comparison
        </button>
        </div>
      )}
      <div className="flex flex-row justify-center space-x-12 ml-10">
        <button 
        onClick={handleCompare} 
        className="compare-page-buttons"
        >
          Compare
        </button>
        {isLoggedIn && (
        <button className="compare-page-buttons" 
        onClick={handleAISuggestion}>
          🪄AI Analysis
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
      {showConfirmationModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Comparison Saved! 🎉</h2>
          <p className="text-gray-600">Your comparison was saved successfully. You can view it on your dashboard.</p>
          <div className="flex justify-center space-x-4">
            <Link to="/userDashboard" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Go to Dashboard
            </Link>
            <button
              onClick={() => setShowConfirmationModal(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Stay Here
            </button>
          </div>
        </div>
      </div>
    )}

      <div id="report-section" className="flex flex-col items-center w-full">
      {/* AI Suggestion Box */}
      {showAiBox && (
        <AISuggestionBox
          aiLoading={aiLoading}
          aiSuggestion={aiSuggestion}
          setShowAiBox={setShowAiBox}
        />
      )}

            <ComparisonResults
              hasCompared={hasCompared}
              nonNumericalComparison={nonNumericalComparison}
              comparisonResult={comparisonResult}
              overallRating1={overallRating1}
              fuelEfficiency1={fuelEfficiency1}
              power1={power1}
              make1={make1}
              overallRating2={overallRating2}
              fuelEfficiency2={fuelEfficiency2}
              power2={power2}
              make2={make2}
              viewMode={viewMode}
              sections={sections}
              activeTab={activeTab}
              handleNextTab={handleNextTab}
              handlePrevTab={handlePrevTab}
              resultsRef={resultsRef}
            />

        
    </div>
    </div>
);
}

export default Compare;
