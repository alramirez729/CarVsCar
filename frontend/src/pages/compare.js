import React, { useState, useEffect, useContext, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faCarSide, faTimes, faChevronLeft, faChevronRight, faList, faThLarge } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../AuthContext';
import ReactSpeedometer from "react-d3-speedometer";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

function Compare() {

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

  const [viewMode, setViewMode] = useState('list'); // 'list' or 'tab'
  const [activeTab, setActiveTab] = useState(0);
  const sections = ['Overall Ratings', 'Car Features', 'Performance Charts'];
  
  const handleNextTab = () => {
    setActiveTab((prev) => (prev + 1) % sections.length);
  };
  
  const handlePrevTab = () => {
    setActiveTab((prev) => (prev - 1 + sections.length) % sections.length);
  };

  const hardcodedCarMakes = [
    "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley",
    "BMW", "Bugatti", "Buick", "Cadillac", "Chevrolet", "Chrysler",
    "Citroën", "Dacia", "Daewoo", "Daihatsu", "Dodge", "Ferrari",
    "Fiat", "Fisker", "Ford", "Genesis", "GMC", "Great Wall",
    "Haval", "Honda", "Hummer", "Hyundai", "Infiniti", "Isuzu",
    "Jaguar", "Jeep", "Kia", "Koenigsegg", "Lada", "Lamborghini",
    "Lancia", "Land Rover", "Lexus", "Lincoln", "Lotus", "Lucid",
    "Maserati", "Maybach", "Mazda", "McLaren", "Mercedes-Benz",
    "Mercury", "Mini", "Mitsubishi", "Nio", "Nissan", "Opel",
    "Pagani", "Peugeot", "Polestar", "Pontiac", "Porsche", "Ram",
    "Renault", "Rivian", "Rolls-Royce", "Saab", "Saturn", "Scion",
    "Seat", "Skoda", "Smart", "SsangYong", "Subaru", "Suzuki",
    "Tesla", "Toyota", "Vauxhall", "Volkswagen", "Volvo", "Zotye"
  ];
  
  const [carMakes, setCarMakes] = useState(hardcodedCarMakes);
  
  

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
      const weightFuelEfficiency = 0.7;
      const weightPower = 0.3;
  
      // Calculate normalized scores
      const calculateFuelEfficiencyScore = (mpg) => Math.min((mpg / maxMpg) * 100, 100);
      const calculatePowerScore = (cylinders) => Math.min((cylinders / maxCylinders) * 100, 100);
  
      // Calculate overall rating
      const calculateOverallRating = (fuelEfficiency, power) => {
        const fuelEfficiencyScore = calculateFuelEfficiencyScore(fuelEfficiency);
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
  

  // Currently only fetches car brands that were produced in 2022


  //autoscroll when clicking the compare button
  useEffect(() => {
    if (comparisonResult.length > 0 && resultsRef.current) {
      const offset = -1600; // Adjust this value to move the scroll position up
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
        const response = await fetch(
            `https://api.api-ninjas.com/v1/cars?make=${make}&model=${encodeURIComponent(model)}&year=${year}&limit=75`,
            {
              method: 'GET',
              headers: { 'X-Api-Key': process.env.REACT_APP_API_KEY },
            }
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


const fetchSuggestions = async (type, make = '', model = '', carNumber) => {
  if (!carNumber) {
      console.error('carNumber is missing. You must pass carNumber explicitly (1 or 2).');
      return;
  }

  try {
      let endpoint = '';

      // Adjust endpoint based on type
      if (type === 'model') {
          if (!make) {
              console.error('Make is required for fetching models.');
              return;
          }
          endpoint = `https://api.api-ninjas.com/v1/carmodels?make=${make}`;
      } else if (type === 'year') {
          if (!make || !model) {
              console.error('Make and Model are required for fetching years.');
              return;
          }
          

          endpoint = `https://api.api-ninjas.com/v1/cars?make=${make}&model=${encodeURIComponent(model)}&limit=100`;
          // ✅ Reset year suggestions before fetching new data
        if (carNumber === 1) {
          setYearSuggestions1([]);
          setYear1(''); // Reset year selection
        } else if (carNumber === 2) {
          setYearSuggestions2([]);
          setYear2(''); // Reset year selection
        }
        } else {
          console.error(`Invalid type: ${type}`);
          return;
      }

      // Make the API request
      const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
              'X-Api-Key': process.env.REACT_APP_API_KEY,
          },
      });

      if (!response.ok) {
          console.error(`Error fetching ${type} suggestions: ${response.statusText}`);
          return;
      }

      const data = await response.json();

      // Update the state based on type
      if (type === 'model') {
          if (carNumber === 1) {
              setModelSuggestions1(data);
              console.log('Model suggestions for Car 1:', data);
          } else if (carNumber === 2) {
              setModelSuggestions2(data);
              console.log('Model suggestions for Car 2:', data);
          }
      } else if (type === 'year') {
        const years = [...new Set(data.map((car) => car.year))].sort((a, b) => b - a);
    
        if (years.length === 0) {
            setAlertMessage(`No year data available for ${make} ${model}. Please select another model.`);
            setAlertType('error');
    
            // ✅ Instead of empty array, set a placeholder to indicate missing data
            if (carNumber === 1) setYearSuggestions1(["No available years"]);
            else if (carNumber === 2) setYearSuggestions2(["No available years"]);
            return;
        }
    
        if (carNumber === 1) {
            setYearSuggestions1(years);
        } else if (carNumber === 2) {
            setYearSuggestions2(years);
        }
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

  
  //Box above the graphs
  const generateNonNumericalComparison = (data1, data2) => {
    const nonNumericalMetrics = ["class", "transmission", "drive", "fuel_type"];
    const labels = {
        class: "Class",
        transmission: "Transmission",
        drive: "Drive Type",
        fuel_type: "Fuel Type"
    };

    const formatTransmission = (value) => {
        return value === 'm' ? "Manual" : value === 'a' ? "Automatic" : value;
    };

    const formatDriveType = (value) => {
        const driveMap = {
            'fwd': 'Front-wheel drive',
            'rwd': 'Rear-wheel drive',
            'awd': 'All-wheel drive',
            '4wd': 'Four-wheel drive'
        };
        return driveMap[value] || value;
    };

    return (
      <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-100 to-gray-50 
                  rounded-lg shadow-md border border-gray-200 
                  w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto my-10">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-700 mb-4 font-mono text-center">Car Feature Overview</h2>
            
            {/* Header Row */}
            <div className="grid grid-cols-3 w-full bg-blue-300 py-2 rounded-t-lg text-center font-semibold text-gray-700 p-4">
                <p className="font-bold font-mono text-lg italic text-gray-600 text-left">   Spec.</p>
                <p className="font-bold font-mono text-lg italic text-gray-700 text-left">{make1}:</p>
                <p className="font-bold font-mono text-lg italic text-gray-700 text-left">{make2}:</p>
            </div>            
       {nonNumericalMetrics.map((metric, index) => {
                const car1Value = 
                    metric === 'transmission' ? formatTransmission(data1[0][metric]) :
                    metric === 'drive' ? formatDriveType(data1[0][metric]) : 
                    data1[0][metric];

                const car2Value = 
                    metric === 'transmission' ? formatTransmission(data2[0][metric]) :
                    metric === 'drive' ? formatDriveType(data2[0][metric]) : 
                    data2[0][metric];

                return (
                  <div
                      key={metric}
                      className={`grid grid-cols-3 w-full py-3 px-4 t ext-center items-center
                          ${index % 2 === 0 ? 'bg-blue-200' : 'bg-blue-100'}
                          border-b border-gray-300
                      `}
                  >
                        <p className="text-lg font-mono font-medium text-gray-800">{labels[metric]}</p>
                        <p className="text-lg font-mono  text-gray-700 font-semibold">{car1Value?.charAt(0).toUpperCase() + car1Value?.slice(1) || 'N/A'}</p>
                        <p className="text-lg font-mono  text-gray-700 font-semibold">{car2Value?.charAt(0).toUpperCase() + car2Value?.slice(1) || 'N/A'}</p>
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

    } catch (error) {
      console.error('Error comparing cars:', error);
      setAlertMessage('An error occurred during comparison. Please try again.');
      setAlertType('error');
    }
  };

  // User Preferences
  const fetchUserPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found. User is not authenticated.");
        return null;
      }
  
      console.log("Sending request to fetch user preferences...");
  
      const response = await fetch('http://localhost:3000/users/preferences', {  
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Response Status:", response.status);
      
      // Read raw text response for debugging
      const textResponse = await response.text();
      console.log("Raw Response:", textResponse);
  
      // Try parsing JSON manually
      const data = JSON.parse(textResponse);
      console.log("Fetched Preferences:", data);
  
      return data.preferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  };
  

  const handleAISuggestion = async () => {
    if (!make1 || !model1 || !year1 || !make2 || !model2 || !year2) {
      alert("Please select two cars before requesting AI suggestions.");
      return;
    }

    setAiSuggestion('');
    setShowAiBox(true);
    setAiLoading(true);

    try {
      const userPreferences = await fetchUserPreferences();
      if (!userPreferences) {
        alert("Error fetching user preferences.");
        setAiLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/api/ai-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car1: { make: make1, model: model1, year: year1 },
          car2: { make: make2, model: model2, year: year2 },
          userPreferences
        })
      });

      const data = await response.json();
      setAiLoading(false);

      if (data.suggestion) {
        displayTextCharacterByCharacter(data.suggestion);
      } else {
        setAiSuggestion('Error retrieving AI suggestion.');
      }
    } catch (error) {
      console.error("Error fetching AI suggestion:", error);
      setAiSuggestion("Failed to get AI response.");
      setAiLoading(false);
    }
  };

  // Function to display text character by character
  const displayTextCharacterByCharacter = (text) => {
    let index = 0;
    setAiSuggestion('');
    const interval = setInterval(() => {
      if (index <= text.length) {
        setAiSuggestion((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 10); // Adjust speed (lower is faster)
  };

  const renderSpeedometers = (title, overallRating, fuelEfficiency, power) => {
    return (
      <div className="flex flex-col items-center lg:space-y-6 sm:space-y-0">
        <ReactSpeedometer
          value={overallRating}
          minValue={0}
          maxValue={100}
          needleColor="red"
          startColor="red"
          endColor="green"
          segments={10}
          textColor="#000"
          currentValueText="Overall Rating: ${value}"
        />
        <ReactSpeedometer
          value={fuelEfficiency}
          minValue={0}
          maxValue={100}
          needleColor="red"
          startColor="red"
          endColor="green"
          segments={10}
          textColor="#000"
          currentValueText="Fuel Efficiency: ${value}"
        />
        <ReactSpeedometer
          value={power}
          minValue={0}
          maxValue={10} // Assuming 10 cylinders max
          needleColor="red"
          startColor="red"
          endColor="green"
          segments={10}
          textColor="#000"
          currentValueText="Power: ${value}"
        />
      </div>
    );
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
    const isCar1Better = car1Value > car2Value;
    const isCar2Better = car2Value > car1Value;
  
    const toggleExplanation = () => setExplanationVisible(!explanationVisible);
  
    // Utility to get the shortened metric label
    const getShortMetricLabel = (metricLabel) => {
      const words = metricLabel.split(" ");
      return words.slice(1).join(" ") || metricLabel;
    };
  
    // ✅ Bar Chart method
  const renderBarChart = () => {
    const data = [
      {
        metric: metricLabel,
        [car1.make]: car1Value,
        [car2.make]: car2Value,
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

  return (
    <div className="flex flex-col p-2 gap-0 bg-gray-100 rounded-lg shadow-md mb-4">
      {/* Metric Label and Explanation */}
      <div className="flex items-center justify-between w-full mb-2">
        <h3 className="text-xl font-bold font-sans">{metricLabel}</h3>
        <FontAwesomeIcon 
          icon={faQuestionCircle} 
          className="ml-2 text-blue-600 cursor-pointer transition-transform duration-200 hover:scale-110"           onClick={toggleExplanation} 
        />
      </div>

      {/* Explanation Toggle */}
      {explanationVisible && (
        <p className="text-sm text-gray-600 mb-3 font-mono">
          {metricExplanations[metric]}
        </p>
      )}

      {/* Car 1 and Car 2 Cards */}
      <div className="flex flex-row w-full gap-4">
        {/* Car 1 Box */}
        <div className={"items-center p-4 rounded-lg shadow-md w-1/2 transition-colors duration-300 font-mono bg-sky-200"}>
          <h4 className="font-semibold text-sm">{car1.make} - {car1.model} ({car1.year})</h4>
        </div>

        {/* Car 2 Box */}
        <div className={"items-center p-4 rounded-lg shadow-md w-1/2 transition-colors duration-300 font-mono bg-fuchsia-300"}>
          <h4 className="font-semibold text-sm">{car2.make} - {car2.model} ({car2.year})</h4>
        </div>
      </div>

      {/* Bar Chart Appears Below the Metric Row (Centered) */}
      <div className="flex justify-center items-center mt-4">
        {renderBarChart()}
      </div>

    </div>
  );
};

  // Explanations for each metric in layman's terms
  const metricExplanations = {
    combination_mpg: "Combined miles per gallon (MPG) is the average fuel efficiency of the car, combining both city and highway driving.",
    city_mpg: "City miles per gallon (MPG) is how many miles the car can travel on one gallon of fuel in city driving conditions.",
    highway_mpg: "Highway miles per gallon (MPG) is how many miles the car can travel on one gallon of fuel on the highway.",
    cylinders: "Cylinders are the components of an engine that provide power. More cylinders typically mean more power but less fuel efficiency.",
    displacement: "Displacement is the total volume of all the cylinders in the engine, usually measured in liters. It is an indicator of engine size and power."
  };

  return (
    <div className="flex flex-col items-center justify-center w-full my-min-h-screen p-10 bg-white">
      <h1 className="heading tracking-widest ring-1 ring-slate-300 bg-slate-200 rounded-l h-30 w-30 border-b-gray-300 border-2 p-5">Car Comparison</h1>
      
      <h1 className="subheading">Select two vehicles to see how they compare.</h1>
      <div className=" w-full flex flex-row space-x-4 my-4 justify-end">
        <button
        className={`inline-flex items-center space-x-2 text-blue font-sans py-2 px-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'bg-gray-300 text-black'}`}
        onClick={() => setViewMode('list')}
      >
        <FontAwesomeIcon icon={faList} className="w-4 h-4" /> {/* List View Icon */}
        <span>List View</span>
      </button>

      <button
        className={`inline-flex items-center space-x-2 text-blue font-sans py-2 px-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg ${viewMode === 'tab' ? 'bg-cyan-500 text-white' : 'bg-gray-300 text-black'}`}
        onClick={() => setViewMode('tab')}
      >
        <FontAwesomeIcon icon={faThLarge} className="w-4 h-4" /> {/* Tab View Icon */}
        <span>Tab View</span>
      </button>
      </div>
      <div className="flex flex-col md:flex-row md:justify-between w-full max-w-8xl gap-5 -my-0">
        {/* Car 1 Input */}
        <div className="flex flex-col items-center ring-1 ring-slate-500 shadow-xl p-5 rounded-lg w-full hover:bg-sky-50 bg-sky-100">
        <div className="w-36 min-h-36 flex items-center justify-center">
            {carLogo1 ? (
                <img 
                    src={carLogo1} 
                    alt="Car 1 Logo" 
                    className="w-36 h-36 object-contain mx-auto hover:scale-125 transition-transform"
                />
            ) : (
                <FontAwesomeIcon icon={faCarSide} size="5x" />
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
        <div className="flex flex-col items-center bg-fuchsia-100 ring-1 ring-slate-500 shadow-xl p-5 rounded-lg w-full hover:bg-fuchsia-50">
        <div className="w-36 min-h-36 flex items-center justify-center ">
            {carLogo2 ? (
                <img 
                    src={carLogo2} 
                    alt="Car 1 Logo" 
                    className="w-36 h-36 object-contain mx-auto hover:scale-125 transition-transform "
                />
            ) : (
                <FontAwesomeIcon icon={faCarSide} size="5x" className="transform scale-x-[-1]"/>
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
  
      <div className="flex flex-row gap-5 my-0 justify-center space-x-2 -mr-12">
        <button onClick={handleCompare} className="compare-page-buttons">
          Compare
        </button>
        {isLoggedIn && (
        <button className="compare-page-buttons" onClick={handleAISuggestion}>
          🪄 AI suggestion
        </button>
      )}
      </div>

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

        {showAlert && (
          <div
            className="p-4 -my-10 ml-32 fixed text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 shadow-lg"
            role="alert"
          >
            <span className="font-medium ">Sorry!</span> Still working on this feature :)
          </div>
        )}

      {viewMode === 'list' ? (
        <>
          {/* Non-Numerical Comparison Box */}
          {nonNumericalComparison && nonNumericalComparison}
          {/* Numerical Comparison Results */}

          <div className="flex flex-col sm:flex-row justify-between gap-12 md:gap-8 sm:gap-4 my-10 items-center">
            {/* Car 1 Speedometer */}
            <div className="flex flex-col items-center">
              <h4 className="font-semibold text-sm text-center font-sans bg-sky-400 text-white px-4 py-1 my-4 rounded-lg">
                {make1 && model1 ? `${make1} - ${model1} (${year1})` : "Car 1"}
              </h4>
              {renderSpeedometers("Car 1", overallRating1, fuelEfficiency1, power1)}
            </div>

            {/* Car 2 Speedometer */}
            <div className="flex flex-col items-center">
              <h4 className="font-semibold text-sm text-center font-sans bg-fuchsia-500 text-white px-4 py-1 my-4 rounded-lg">
                {make2 && model2 ? `${make2} - ${model2} (${year2})` : "Car 2"}
              </h4>
              {renderSpeedometers("Car 2", overallRating2, fuelEfficiency2, power2)}
            </div>
          </div>
          <div ref={resultsRef} className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-2 w-full justify-center items-center">
            {comparisonResult.length > 0 ? (
              comparisonResult.map((metricComponent, index) => (
                <div key={index} className="flex flex-row items-center">
                  <div className>{metricComponent}</div>
                </div>
              ))
            ) : (
              <p>No comparison results to display yet.</p>
            )}
          </div>
            </>
          ) : (
          <>
            {/* Tab View */}
            <div className="w-full flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-4">{sections[activeTab]}</h2>

              <div className="flex flex-row items-center w-full max-w-4xl">
                {/* Left Arrow */}
                <button onClick={handlePrevTab} className="text-2xl p-2">
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                {/* Tab Content */}
                <div className="w-full flex justify-center">
                {activeTab === 0 && (
                    <>
                      <div className="flex justify-between w-full">
                        {renderSpeedometers("Car 1", overallRating1, fuelEfficiency1, power1)}
                        {renderSpeedometers("Car 2", overallRating2, fuelEfficiency2, power2)}
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
                <button onClick={handleNextTab} className="text-2xl p-2">
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
          </>
        )}
</div>
);
}

export default Compare;
