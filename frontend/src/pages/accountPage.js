import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function AccountPage() {
  const [selectedSection, setSelectedSection] = useState('Profile'); // Default section
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    age:  null,
  });
  const [editField, setEditField] = useState(null);
  const [editedValue, setEditedValue] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found'); // Handle missing token
  
        const response = await axios.get('http://localhost:3000/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserInfo(response.data.user);
      } catch (error) {
        console.error('Error fetching user info:', error);
  
        // Only logout if error is specifically a 401
        if (error.response?.status === 401) {
          setIsLoggedIn(false);
          navigate('/login');
        }
      }
    };
  
    fetchUserInfo();
  }, [setIsLoggedIn, navigate]);


  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/login');
    console.log('User logged out');
  };

  const handleEditClick = (field) => {
    setEditField(field);
    setEditedValue(userInfo[field]);
  };

  const handleSaveClick = async (field) => {
    try {
      const response = await axios.put('http://localhost:3000/users/update', {
        [field]: editedValue,
      });
      console.log('Update successful:', response.data);

      // Update the local state with the new value
      setUserInfo({ ...userInfo, [field]: editedValue });
      setEditField(null); // Exit edit mode
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  };

  const profileSection = (
    <div className="space-y-4">
      {Object.keys(userInfo).map((field) => (
        <div key={field} className="flex justify-between items-center mb-4">
          <label className="font-semibold text-gray-700 capitalize">{field}:</label>
          {editField === field ? (
            <div className="flex items-center space-x-2">
              <input
                type={field === 'age' ? 'number' : 'text'}
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 w-40"
              />
              <button
                onClick={() => handleSaveClick(field)}
                className="text-green-500 hover:text-green-700"
              >
                <FontAwesomeIcon icon={faSave} />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>{userInfo[field]}</span>
              <button
                onClick={() => handleEditClick(field)}
                className="text-blue-500 hover:text-blue-700"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const sections = {
    Profile: profileSection,
    Settings: <div>Your Account Settings</div>,
    Security: <div>Security and Password Options</div>,
    Logout: (
      <button
        className="general-button-styling"
        onClick={handleLogout}
      >
        Logout
      </button>
    ),
  };

  return (
    <div className="flex h-screen mx-0">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-800 text-white p-6 space-y-4">
        <h2 className="text-lg font-bold mb-4">Account</h2>
        <ul className="space-y-2">
          {Object.keys(sections).map((section) => (
            <li
              key={section}
              className={`cursor-pointer p-2 rounded ${
                selectedSection === section ? 'bg-cyan-500' : 'hover:bg-gray-700'
              }`}
              onClick={() => setSelectedSection(section)}
            >
              {section}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="w-3/4 bg-gray-100 p-6">
        <h1 className="text-xl font-semibold mb-4">{selectedSection}</h1>
        <div>{sections[selectedSection]}</div>
      </main>
    </div>
  );
}

export default AccountPage;
