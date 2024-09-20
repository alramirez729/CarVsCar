import React, { useState, useEffect } from 'react';
import './Compare.css'; 
import carImage from './images/car.JPG'; // Import the image
import carFlipImage from './images/carflip.JPG'; // Import the flipped image

function Compare() {
  const [carData, setCarData] = useState([]); // Store entire car data
  const [carMakes, setCarMakes] = useState([]);
  const [filteredModels1, setFilteredModels1] = useState([]);
  const [filteredModels2, setFilteredModels2] = useState([]);
  const [brand1, setBrand1] = useState('');
  const [brand2, setBrand2] = useState('');
  const [model1, setModel1] = useState('');
  const [model2, setModel2] = useState('');
  const [mileage1, setMileage1] = useState('');
  const [mileage2, setMileage2] = useState('');
  const [comparisonResult, setComparisonResult] = useState('');
  const [dropdown1, setDropdown1] = useState([]);
  const [dropdown2, setDropdown2] = useState([]);

  useEffect(() => {
    // Load car data when component mounts
    const loadCarData = async () => {
      try {
        const response = await fetch('https://freetestapi.com/api/v1/cars');
        const data = await response.json();
        setCarData(data);
        setCarMakes([...new Set(data.map(car => car.make))]); // Extract unique makes
        console.log('Car data loaded:', data);
      } catch (error) {
        console.error('Error fetching car data:', error);
      }
    };
    loadCarData();
  }, []);

  const filterMakes = (brand, setDropdown) => {
    const filteredMakes = carMakes.filter(make =>
      make.toLowerCase().includes(brand.toLowerCase())
    );
    setDropdown(filteredMakes);
  };

  const filterModels = (selectedMake, setFilteredModels) => {
    const filteredModels = carData
      .filter(car => car.make.toLowerCase() === selectedMake.toLowerCase())
      .map(car => car.model);
    setFilteredModels([...new Set(filteredModels)]); // Set unique models
  };

  const handleCompare = () => {
    // Filter the car data for the first selected car
    const data1 = carData.find(
      (car) => car.make.toLowerCase() === brand1.toLowerCase() && car.model.toLowerCase() === model1.toLowerCase()
    );
  
    // Filter the car data for the second selected car
    const data2 = carData.find(
      (car) => car.make.toLowerCase() === brand2.toLowerCase() && car.model.toLowerCase() === model2.toLowerCase()
    );
  
    // Check if both cars are found
    if (data1 && data2) {
      const winner = compareCarData(data1, data2);
      displayComparison(winner, data1, data2);
    } else {
      setComparisonResult("One or both cars were not found.");
    }
  };


  //this function will determine the winner of the comparison. 
  const compareCarData = (data1, data2) => {
    return data1.rating > data2.rating ? data1 : data2;
  };

  const displayComparison = (winner, data1, data2) => {
    setComparisonResult(`
      <h2>Comparison Result</h2>
      <p>Car 1: ${data1.make} ${data1.model} - Mileage: ${data1.mileage} - Rating: ${data1.rating}</p>
      <p>Car 2: ${data2.make} ${data2.model} - Mileage: ${data2.mileage} - Rating: ${data2.rating}</p>
      <h3>Winner: ${winner.make} ${winner.model}</h3>
    `);
  };

  return (
    <div id="content">
      <h1>Car vs. Car</h1>
      <div className="comparison-container">
        {/* Box 1 */}
        <div className="comparison-box">
          <img src={carImage} alt="Car 1" className="car-image" />
          <div className="input-container">
            <input
              type="text"
              value={brand1}
              onChange={(e) => {
                setBrand1(e.target.value);
                filterMakes(e.target.value, setDropdown1);
                filterModels(e.target.value, setFilteredModels1); // Filter models based on make
              }}
              placeholder="Enter Car 1 Brand"
            />
            {dropdown1.length > 0 && (
              <div className="dropdown">
                {dropdown1.map(make => (
                  <div
                    key={make}
                    className="dropdown-item"
                    onClick={() => {
                      setBrand1(make);
                      setDropdown1([]);
                      filterModels(make, setFilteredModels1); // Filter models when make is selected
                    }}
                  >
                    {make}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={model1}
              onChange={(e) => setModel1(e.target.value)}
              placeholder="Enter Car 1 Model"
            />
            {filteredModels1.length > 0 && (
              <div className="dropdown">
                {filteredModels1.map(model => (
                  <div
                    key={model}
                    className="dropdown-item"
                    onClick={() => {
                      setModel1(model);
                      setFilteredModels1([]);
                    }}
                  >
                    {model}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={mileage1}
              onChange={(e) => setMileage1(e.target.value)}
              placeholder="Enter Car 1 Mileage"
            />
          </div>
        </div>

        {/* Box 2 */}
        <div className="comparison-box">
          <img src={carFlipImage} alt="Car 2" className="car-image" />
          <div className="input-container">
            <input
              type="text"
              value={brand2}
              onChange={(e) => {
                setBrand2(e.target.value);
                filterMakes(e.target.value, setDropdown2);
                filterModels(e.target.value, setFilteredModels2); // Filter models based on make
              }}
              placeholder="Enter Car 2 Brand"
            />
            {dropdown2.length > 0 && (
              <div className="dropdown">
                {dropdown2.map(make => (
                  <div
                    key={make}
                    className="dropdown-item"
                    onClick={() => {
                      setBrand2(make);
                      setDropdown2([]);
                      filterModels(make, setFilteredModels2); // Filter models when make is selected
                    }}
                  >
                    {make}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={model2}
              onChange={(e) => setModel2(e.target.value)}
              placeholder="Enter Car 2 Model"
            />
            {filteredModels2.length > 0 && (
              <div className="dropdown">
                {filteredModels2.map(model => (
                  <div
                    key={model}
                    className="dropdown-item"
                    onClick={() => {
                      setModel2(model);
                      setFilteredModels2([]);
                    }}
                  >
                    {model}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={mileage2}
              onChange={(e) => setMileage2(e.target.value)}
              placeholder="Enter Car 2 Mileage"
            />
          </div>
        </div>
      </div>
      <div>
        <button onClick={handleCompare} className="center-button">
          Compare
        </button>
      </div>
      <div id="comparisonResult" dangerouslySetInnerHTML={{ __html: comparisonResult }} />
    </div>
  );
}

export default Compare;
