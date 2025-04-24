import React, { useState, useEffect } from 'react';
import hardcodedCarMakes from "../constants/makes.js";
import Loading from '../components/Loading';

function SearchVehicles() {
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    fuel_type: '',
    drive: '',
    transmission: '',
    cylinders: '',
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [makes] = useState(hardcodedCarMakes);


  const classMap = {
    "SUV" : 'special purpose vehicle',
    "Large Car" : 'special purpose vehicle' ||'large car',
    "Midsize Car" : 'midsize car',
    "Sub Compact" : 'subcompact car',
    "Station Wagon" : 'midsize station wagon',
    "Sedan": 'compact car',
    "Truck": 'standard pickup truck',
    "Coupe": 'two seater',
    "Hatchback": 'hatchback',
    "Van": 'van'
  };

  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/carmakes`);
        const data = await res.json();
      } catch (err) {
        console.error('Error loading car makes:', err.message);
      }
    };
  
    fetchMakes();
  }, []);

  const buildQuery = (filters) => {
    const query = new URLSearchParams();
  
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });
  
    const classKeyword = classMap[selectedClass]?.toLowerCase();
    if (classKeyword) {
      query.append('class', classKeyword); // 👈 Add this line
    }
  
    query.append('limit', 50);
    return query.toString();
  };
  

  useEffect(() => {
    const hasFilters = Object.values(filters).some(val => val.trim() !== '') || selectedClass;

    if (!hasFilters) {
      setVehicles([]);
      return;
    }
    console.log(filters);

    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/cars?${buildQuery(filters)}`,
        );
        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        console.log("Sample vehicle data:", data.slice(0, 50));

        const classKeyword = classMap[selectedClass]?.toLowerCase();
        const filtered = selectedClass
          ? data.filter(car =>
              car.class && car.class.toLowerCase().includes(classKeyword)
            )
          : data;

        setVehicles(filtered);
      } catch (err) {
        console.error('Fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [filters, selectedClass]);


  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Search Vehicles</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <select
          value={filters.make}
          onChange={(e) => setFilters(f => ({ ...f, make: e.target.value }))}
          className="p-2 border rounded"
        >
          <option value="">All Makes</option>
          {makes.map((make) => (
            <option key={make} value={make.toLowerCase()}>{make}</option>
          ))}
        </select>

        <input
          placeholder="Model"
          value={filters.model}
          onChange={(e) => setFilters(f => ({ ...f, model: e.target.value.toLowerCase() }))}
          className="p-2 border rounded"
        />
        <select onChange={(e) => setFilters(f => ({ ...f, fuel_type: e.target.value }))}>
          <option value="">All Fuels</option>
          <option value="gas">Gas</option>
          <option value="diesel">Diesel</option>
          <option value="electricity">Electric</option>
        </select>
        <select onChange={(e) => setFilters(f => ({ ...f, drive: e.target.value }))}>
          <option value="">All Drive</option>
          <option value="fwd">FWD</option>
          <option value="rwd">RWD</option>
          <option value="awd">AWD</option>
          <option value="4wd">4WD</option>
        </select>
        <select onChange={(e) => setFilters(f => ({ ...f, transmission: e.target.value }))}>
          <option value="">All Transmissions</option>
          <option value="a">Automatic</option>
          <option value="m">Manual</option>
        </select>
        <select onChange={(e) => setFilters(f => ({ ...f, cylinders: e.target.value }))}>
          <option value="">All Cylinders</option>
          {[2, 3, 4, 5, 6, 8, 10, 12, 16].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {Object.keys(classMap).map(type => (
          <button
            key={type}
            onClick={() => setSelectedClass(selectedClass === type ? '' : type)}
            className={`px-4 py-2 rounded-full border text-sm font-semibold 
              ${selectedClass === type 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-100'}`}
          >
            {type}
          </button>
        ))}
      </div>
      {vehicles.length === 0 && !loading && (
        <p className="text-gray-500 italic">No matching vehicles found. Try adjusting your filters. 
        (hint: start with adjusting "makes")</p>
      )}


      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {vehicles.map((car, idx) => (
            <div key={idx} className="p-4 border rounded shadow bg-stone-50 hover:scale-105 hover:bg-teal-50 duration-300">
              <h2 className="font-bold">{car.make} {car.model}</h2>
              <p className="text-sm text-gray-600">{car.year}</p>
              <p>MPG: {car.combination_mpg || 'N/A'}</p>
              <p>{car.fuel_type}, {car.drive}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchVehicles;
