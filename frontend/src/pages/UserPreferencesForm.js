import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from '../components/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';


function UserPreferencesForm() {
  const [showExplanation, setShowExplanation] = useState(false);

  const [preferences, setPreferences] = useState({
    occupation: '',
    annualMiles: '',
    safetyImportance: 5,
    fuelEfficiencyImportance: 5,
    horsepowerImportance: 5,
    speedImportance: 5,
    carUsage: '',
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false); // ✅ Controls if form is editable
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch existing preferences
    const fetchPreferences = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://car-vs-car-api.onrender.com/users/preferences', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.preferences) {
          setPreferences(response.data.preferences);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const handleChange = (e) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'https://car-vs-car-api.onrender.com/users/preferences',
        preferences,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage('Preferences saved successfully!');
      setEditing(false); // ✅ Return to summary mode after saving
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('Error saving preferences. Try again.');
    }
  };

  if (loading) return <Loading/>

  return (
    
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
      {/* 🔹 Why Are We Asking This? Section */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">Your Car Preferences</h2>
      {/* 🔹 Why Are We Asking This? Section */}
        <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-4">
          <p className="text-gray-700 font-semibold">Why are we asking for this info?</p>
          <FontAwesomeIcon 
            icon={faQuestionCircle} 
            className="text-blue-600 cursor-pointer transition-transform duration-200 hover:scale-110 ml-2" 
            onClick={() => setShowExplanation(!showExplanation)}
          />
        </div>

        {/* 🔹 Explanation Box (Only shows when clicked) */}
        {showExplanation && (
          <div className="bg-blue-100 text-blue-800 p-4 rounded-lg mb-4 shadow-md">
            <p>
              To use the AI comparison tool feature on the compare page, we will use this information 
              to tailor the response to your actual needs and preferences. 
              Feel free to share as much or as little information as you want.
            </p>
          </div>
        )}

      {message && <p className="text-green-500 text-sm">{message}</p>}

      {/* ✅ Show Summary View when NOT Editing */}
      {!editing ? (
        <div className="space-y-4">
          <p><strong>Occupation:</strong> {preferences.occupation || 'Not set'}</p>
          <p><strong>Annual Miles Driven:</strong> {preferences.annualMiles || 'Not set'}</p>
          <p><strong>Safety Importance:</strong> {preferences.safetyImportance}/10</p>
          <p><strong>Fuel Efficiency Importance:</strong> {preferences.fuelEfficiencyImportance}/10</p>
          <p><strong>Horsepower Importance:</strong> {preferences.horsepowerImportance}/10</p>
          <p><strong>Speed & Acceleration Importance:</strong> {preferences.speedImportance}/10</p>
          <p><strong>Car Usage:</strong> {preferences.carUsage || 'Not set'}</p>

          {/* Edit Button */}
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Edit Preferences
          </button>
        </div>
      ) : (
        /* ✅ Show Editable Form when in Edit Mode */
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-gray-700">What is your occupation?</span>
            <input type="text" name="occupation" value={preferences.occupation} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg" />
          </label>

          <label className="block">
            <span className="text-gray-700">How many miles do you drive a year (roughly)?</span>
            <input type="number" name="annualMiles" value={preferences.annualMiles} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg" />
          </label>

          {["safetyImportance", "fuelEfficiencyImportance", "horsepowerImportance", "speedImportance"].map((field) => (
            <label key={field} className="block">
              <span className="text-gray-700">Scale of 1-10: How important is {field.replace("Importance", "").replace(/([A-Z])/g, ' $1').toLowerCase()} to you?</span>
              <input type="number" min="1" max="10" name={field} value={preferences[field]} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg" />
            </label>
          ))}

          <label className="block">
            <span className="text-gray-700">What do you mostly plan on using your car for?</span>
            <textarea name="carUsage" value={preferences.carUsage} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg" />
          </label>

          {/* ✅ Save and Cancel Buttons */}
          <div className="flex space-x-4">
            <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition">Save Preferences</button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
    
  );
}

export default UserPreferencesForm;
