import React, { useState, useEffect } from 'react';
import Loading from '../components/Loading';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { faCar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

let debounceTimeout;

function SearchVehicles() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comparisonQueue, setComparisonQueue] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  const bodyTypes = [
    'midsize car', 'subcompact car', 'compact car', 'special purpose vehicle',
    'midsize station wagon', 'large car', 'standard pickup truck', 'two seater',
    'hatchback', 'van'
  ];

  const fetchFilteredVehicles = async (term, useFallback = false) => {
    setLoading(true);
    try {
      let apiUrl;
      if (term) {
        const query = new URLSearchParams({ make: term, limit: 50 });
        apiUrl = `${process.env.REACT_APP_API_URL}/api/cars?${query.toString()}`;
      } else if (useFallback) {
        const query = new URLSearchParams({ model: 'a', limit: 50 });
        apiUrl = `${process.env.REACT_APP_API_URL}/api/cars?${query.toString()}`;
      } else {
        setFilteredVehicles([]);
        return;
      }

      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const enrichedData = data.map(car => ({ ...car, _id: uuidv4() }));
      setVehicles(enrichedData);

      if (selectedClass) {
        const filtered = enrichedData.filter(car => car.class && car.class.toLowerCase() === selectedClass.toLowerCase());
        setFilteredVehicles(filtered);
      } else {
        setFilteredVehicles(enrichedData);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err.message);
      setFilteredVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      if (searchTerm || selectedClass) {
        fetchFilteredVehicles(searchTerm, !searchTerm && selectedClass);
      } else {
        setFilteredVehicles([]);
      }
    }, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, selectedClass]);

  const handleCarClick = (car) => {
    const isSelected = comparisonQueue.some(
      (qCar) => qCar._id === car._id
    );

    if (isSelected) {
      setComparisonQueue(queue => queue.filter(
        (qCar) => qCar._id !== car._id
      ));
    } else if (comparisonQueue.length < 2) {
      setComparisonQueue(queue => [...queue, car]);
    }
  };

  const renderComparisonSlots = () => {
    const slots = [0, 1].map((index) => {
      const car = comparisonQueue[index];
      return (
        <div
          key={index}
          className="flex flex-col items-center justify-center w-40 h-40 border rounded-lg bg-white shadow-md"
        >
          <FontAwesomeIcon
            icon={faCar}
            >
          </FontAwesomeIcon>
          <p className="text-sm text-center">
            {car ? `${car.make} ${car.model}` : 'Empty Slot'}
          </p>
        </div>
      );
    });
    return <div className="flex gap-4 mb-8">{slots}</div>;
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Search Vehicles</h1>

      <input
        type="text"
        placeholder="Start typing a make (e.g., Toyota, Ford...)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="p-2 border rounded w-full mb-4"
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {bodyTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedClass(selectedClass === type ? '' : type)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${
              selectedClass === type
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-100'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {renderComparisonSlots()}

      {loading ? (
        <Loading />
      ) : (
        <>
          {filteredVehicles.length === 0 && (searchTerm || selectedClass) && (
            <p className="text-gray-500 italic">
              No vehicles found that match your criteria.
            </p>
          )}

          {comparisonQueue.length === 2 && (
            <div className="fixed bottom-4 right-4 z-50">
              <button
                onClick={() => navigate('/compare', { state: { vehicles: comparisonQueue } })}
                className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
              >
                Compare Vehicles
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredVehicles.map((car) => {
              const isSelected = comparisonQueue.some(
                (qCar) => qCar._id === car._id
              );
              return (
                <div
                  key={car._id}
                  onClick={() => handleCarClick(car)}
                  className={`p-4 border rounded shadow hover:scale-105 duration-300 cursor-pointer ${
                    isSelected ? 'bg-blue-100 border-blue-500' : 'bg-white hover:bg-teal-50'
                  }`}
                >
                  <h2 className="font-bold">{car.make} {car.model}</h2>
                  <p className="text-sm text-gray-600">{car.year}</p>
                  <p>Class: {car.class || 'N/A'}</p>
                  <p>MPG: {car.combination_mpg || 'N/A'}</p>
                  <p>{car.fuel_type}, {car.drive}</p>
                  {isSelected && (
                    <div className="mt-2 text-blue-600 text-sm font-semibold">
                      Selected for comparison
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default SearchVehicles;