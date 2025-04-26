import React from 'react';
import carLogoRight from '../pages/images/CarCompareRight.png';
import carLogoLeft from '../pages/images/CarCompareLeft.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

function CarInputCard({
  carNumber,
  make,
  setMake,
  model,
  setModel,
  year,
  setYear,
  carMakes,
  modelSuggestions,
  yearSuggestions,
  carLogo,
  resetCar,
  fetchSuggestions
}) {
  return (
    <div className={`flex flex-col items-center ring-8 shadow-xl p-5 rounded-lg w-full
      ${carNumber === 1 ? 'ring-sky-100' : 'ring-fuchsia-100'}`
    }>
      {/* Reset Button */}
      <div className="relative w-full">
        <button
          onClick={resetCar}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition transform hover:scale-110"
          title={`Reset Car ${carNumber}`}
        >
          <FontAwesomeIcon icon={faSyncAlt} />
        </button>
      </div>

      {/* Car Logo */}
      <div className="w-36 min-h-36 flex items-center justify-center">
        {carLogo ? (
            <img 
            src={carLogo} 
            alt={`Car ${carNumber} Logo`} 
            className="w-36 h-36 object-contain mx-auto hover:scale-125 transition-transform"
            />
        ) : (
            <img 
            src={carNumber === 1 ? carLogoRight : carLogoLeft} 
            alt="Placeholder Logo" 
            className="w-36 h-36 object-contain mx-auto"
            />
        )}
        </div>


      {/* Title */}
      <h2 className="text-xl font-bold font-sans mb-4">
        {make 
          ? model 
            ? `${make.charAt(0).toUpperCase() + make.slice(1)} - ${model.charAt(0).toUpperCase() + model.slice(1)}`
            : make
          : `Car ${carNumber}`
        }
      </h2>

      {/* Make Dropdown */}
      <div className="w-full mb-4">
        <h3 className="font-thin italic font-sans">Select vehicle make:</h3>
        <select
          value={make}
          onChange={(e) => {
            const selectedMake = e.target.value;
            setMake(selectedMake);
            fetchSuggestions('model', selectedMake, '', carNumber);
          }}
          className="dropdown_input_styling"
        >
          <option value="" disabled>Select Car Make</option>
          {carMakes.map((makeOption, index) => (
            <option key={index} value={makeOption}>
              {makeOption}
            </option>
          ))}
        </select>
      </div>

      {/* Model Dropdown */}
      <div className="w-full mb-4">
        <h3 className="font-thin italic font-sans">Select vehicle model:</h3>
        <select
          value={model}
          onChange={(e) => {
            const selectedModel = e.target.value;
            setModel(selectedModel);
            fetchSuggestions('year', make, selectedModel, carNumber);
          }}
          className="dropdown_input_styling"
        >
          <option value="" disabled>Select Car Model</option>
          {modelSuggestions.map((modelOption, index) => (
            <option key={index} value={modelOption}>
              {modelOption}
            </option>
          ))}
        </select>
      </div>

      {/* Year Dropdown */}
      <div className="w-full">
        <h3 className="font-thin italic font-sans">Select vehicle year:</h3>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          onFocus={() => {
            if (make && model) {
              fetchSuggestions('year', make, model, carNumber);
            }
          }}
          className="dropdown_input_styling"
          disabled={yearSuggestions.length === 1 && yearSuggestions[0] === "No available years"}
        >
          <option value="" disabled>
            {yearSuggestions[0] === "No available years" ? "No years available" : "Select Year"}
          </option>
          {yearSuggestions[0] !== "No available years" &&
            yearSuggestions.map((yearOption, index) => (
              <option key={index} value={yearOption}>
                {yearOption}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}

export default CarInputCard;
