import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import UserPreferencesForm from './UserPreferencesForm';
import Loading from '../components/Loading';
import axios from 'axios';

function UserDashboard() {
  const [selectedSection, setSelectedSection] = useState('Car Preferences');
  const { setIsLoggedIn } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', birthdate: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isComparisonLoading, setIsComparisonLoading] = useState(false);
  const [savedComparisons, setSavedComparisons] = useState([]);
  const [editField, setEditField] = useState(null);
  const [editedValue, setEditedValue] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }

    const fetchUserInfo = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const userResponse = await axios.get('https://car-vs-car-api.onrender.com/users/me', { headers });
        const user = userResponse.data.user;
        setUserInfo({ ...user, birthdate: user.birthdate ? user.birthdate.split('T')[0] : '' });
        setSavedComparisons(user.savedComparisons || []);
      } catch (error) {
        console.error('Error fetching user info:', error);
        if (error.response?.status === 401) {
          setIsLoggedIn(false);
          navigate('/login');
        }
      } finally {
        setTimeout(() => setIsLoading(false), 400);
      }
    };
    fetchUserInfo();
  }, [setIsLoggedIn, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleEditClick = (field) => {
    setEditField(field);
    setEditedValue(userInfo[field]);
  };

  

  const handleSaveClick = async (field) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'https://car-vs-car-api.onrender.com/users/update',
        { [field]: editedValue },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      setUserInfo({ ...userInfo, [field]: editedValue });
      setEditField(null);
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  };

  const handleCancelEdit = () => setEditField(null);

  const AccountSection = isLoading ? (
    <Loading />
  ) : (
    <div className="space-y-6">
      {Object.keys(userInfo).filter(field => typeof userInfo[field] !== 'object' || field === 'birthdate').map((field) => (
        <div key={field} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <label className="font-semibold text-gray-700 capitalize font-sans text-xl">{field}:</label>
            {editField === field ? (
              <div className="flex items-center space-x-2">
                <input
                  type={field === 'birthdate' ? 'date' : 'text'}
                  value={editedValue || ''}
                  onChange={(e) => setEditedValue(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button onClick={() => handleSaveClick(field)} className="text-green-500 hover:text-green-700">
                  <FontAwesomeIcon icon={faSave} />
                </button>
                <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-700">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">{userInfo[field]}</span>
                <button onClick={() => handleEditClick(field)} className="text-blue-500 hover:text-blue-700">
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
  

  return (
    <div className="bg-gray-50 min-h-screen w-full overflow-x-hidden relative">

  {/* Sidebar */}
  <aside className={`
  fixed top-0 left-0 z-40 w-72 bg-gray-800 text-white pt-28 p-6 space-y-6 h-screen 
  transition-transform duration-300 transform 
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
  md:translate-x-0
`}>

    <h2 className="font-sans text-3xl font-bold mb-6 underline animate-fade-in">User Dashboard:</h2>
    <ul className="space-y-2 -mx-2 text-xl">
      {['Saved Comparisons', 'Car Preferences', 'Account'].map((section) => (
        <li key={section} 
          className={`cursor-pointer p-3 rounded-lg ${selectedSection === section ? 'bg-cyan-500' : 'hover:bg-gray-700'}`}
          onClick={() => {
            setSelectedSection(section);
            if (window.innerWidth < 768) setSidebarOpen(false); // collapse sidebar on mobile
          }}
        >
          {section}
        </li>
      ))}
      <li className="cursor-pointer p-3 rounded-lg bg-red-500 hover:bg-red-600 text-center" onClick={() => setShowLogoutModal(true)}>
        Logout
      </li>
    </ul>
  </aside>

  {/* Open Sidebar Button (only mobile and only when sidebar closed) */}
  {!sidebarOpen && (
    <button 
      onClick={() => setSidebarOpen(true)} 
      className="fixed top-28 left-4 z-50 bg-cyan-500 text-white p-3 rounded-full shadow-lg md:hidden"
    >
      ☰
    </button>
  )}

<main className={`flex-1 p-8 flex flex-col items-center transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : ''}`}>
<h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-8 text-center font-sans tracking-wide animate-fade-in">{selectedSection}</h1>
        {selectedSection === 'Saved Comparisons' ? (
          <div className="font-sans space-y-6 w-full max-w-7xl animate-fade-in">
            {isComparisonLoading ? (
              <Loading />
            ) : Array.isArray(savedComparisons) && savedComparisons.length > 0 ? (
              savedComparisons.map((comp, index) => {
                const dateString = comp?.date ? new Date(comp.date).toLocaleString() : 'Unknown date';

                const handleDelete = async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`https://car-vs-car-api.onrender.com/users/delete-comparison/${comp._id}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });

                    if (res.ok) {
                      setSavedComparisons(prev => prev.filter(c => c._id !== comp._id));
                      console.log('✅ Deleted successfully');
                    } else {
                      console.error('❌ Delete failed');
                    }
                  } catch (err) {
                    console.error('❌ Error deleting comparison:', err);
                  }
                };

                return (
                  <div
                    key={comp._id || index}
                    className="flex justify-between items-center border p-4 rounded-lg shadow-sm animate-fade-in"
                  >
                    <span className="text-gray-700 font-sans">{dateString}</span>
                    <p className="text-sm italic">
                      {comp.car1.toUpperCase() || 'Car 1'} vs {comp.car2.toUpperCase() || 'Car 2'}
                    </p>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={async () => {
                          const token = localStorage.getItem('token');
                          try {
                            const res = await fetch(`https://car-vs-car-api.onrender.com/compare/view-comparison/${comp._id}`, {
                              headers: { Authorization: `Bearer ${token}` },
                            });

                            if (!res.ok) {
                              alert('⚠️ Could not load PDF.');
                              return;
                            }

                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            window.open(url, '_blank');
                          } catch (err) {
                            console.error('Fetch PDF error:', err);
                            alert('⚠️ Error retrieving the PDF.');
                          }
                        }}
                        className="text-blue-500 hover:underline font-sans"
                      >
                        View PDF
                      </button>
                      <button
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-700 hover:underline font-sans"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 italic font-sans">No comparisons saved yet.</p>
            )}
          </div>
        ) : (
          <div className="font-sans space-y-6 w-full max-w-md animate-fade-in">
            {selectedSection === 'Account' && AccountSection}
            {selectedSection === 'Car Preferences' && <UserPreferencesForm />}
          </div>
        )}

      </main>
    </div>
  );
}

export default UserDashboard;