import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function AccountPage() {
  const [selectedSection, setSelectedSection] = useState('Profile');
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    age: null,
  });
  const [editField, setEditField] = useState(null);
  const [editedValue, setEditedValue] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const response = await axios.get('http://localhost:3000/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserInfo(response.data.user);
      } catch (error) {
        console.error('Error fetching user info:', error);
        if (error.response?.status === 401) {
          setIsLoggedIn(false);
          navigate('/login');
        }
      }
    };

    fetchUserInfo();
  }, [setIsLoggedIn, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
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
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:3000/users/update',
        { [field]: editedValue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Update successful:', response.data);
      setUserInfo({ ...userInfo, [field]: editedValue });
      setEditField(null);
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditField(null);
  };

  const profileSection = (
    <div className="space-y-6">
      {Object.keys(userInfo).map((field) => (
        <div key={field} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <label className="font-semibold text-gray-700 capitalize font-mono text-xl">{field}:</label>
            {editField === field ? (
              <div className="flex items-center space-x-2">
                <input
                  type={field === 'age' ? 'number' : 'text'}
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={() => handleSaveClick(field)}
                  className="font-mono text-green-500 hover:text-green-700"
                >
                  <FontAwesomeIcon icon={faSave} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-red-500 hover:text-red-700"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">{userInfo[field]}</span>
                <button
                  onClick={() => handleEditClick(field)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const sections = {
    Profile: profileSection,
    Settings: <div className="bg-white p-6 rounded-lg shadow-md">Your Account Settings</div>,
    Security: <div className="bg-white p-6 rounded-lg shadow-md">Security and Password Options</div>,
    Logout: (
      <button
        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
        onClick={handleLogout}
      >
        Logout
      </button>
    ),
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-800 text-white p-6 space-y-6 h-screen fixed top-12 left-0">
        <h2 className="font-mono text-3xl font-bold mb-6 underline">Account Page:</h2>
        <ul className="space-y-2 -mx-2 text-xl">
          {Object.keys(sections).map((section) => (
            <li
              key={section}
              className={`font-mono cursor-pointer p-3 rounded-lg transition duration-300 ${
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
      <main className="flex-1 p-8 ml-72 h-screen overflow-y-auto flex flex-col items-center">
      <h1 className="text-6xl font-semibold mb-6 text-gray-800 underline font-mono p-2">{selectedSection}</h1>
        <div className="font-mono space-y-6">{sections[selectedSection]}</div>
      </main>
    </div>
  );
}

export default AccountPage;