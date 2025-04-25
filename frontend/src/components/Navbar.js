import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCodeCompare, faUserCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../AuthContext.js';


function Navbar() {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowLogoutModal(false);
    navigate('/login')
    console.log('User logged out');

  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if(dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
}, []);

  return (
    <nav className="bg-gray-800 text-white w-full py-4 shadow-lg fixed top-0 left-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-6">
        {/* Brand / Logo */}
        <Link to="/" className="text-2xl font-bold font-sans tracking-wide hover:scale-125 transition duration-300">
          Car vs. Car
        </Link>

        {/* Navigation Links */}
        <ul className="flex items-center space-x-8">
          {/* TODO
          <li>
            <Link to="/searchVehicles" className="hover:text-cyan-400 hover:scale-125 transition duration-300 flex items-center space-x-2">
              <FontAwesomeIcon icon={faSearch}/>
              <span className="hidden sm:block font-sans hover:scale-105">Search</span>
            </Link>
            
          </li>
          */}
          <li>
            <Link 
            to="/homepage" 
            className={`navbar-button ${
                  location.pathname === "/homepage" ? "navbar-button-current-page" : ""
                }`}
              >
              <FontAwesomeIcon icon={faHome} />
              <span className="">Home</span>
            </Link>
          </li>
          <li>
            <Link to="/compare" className={`navbar-button ${location.pathname === "/compare" ? "navbar-button-current-page" : ""}`}
  >
              <FontAwesomeIcon icon={faCodeCompare} />
              <span className="navbar-icon">Compare</span>
            </Link>
          </li>
          {!isLoggedIn ? (
            <li>
              <Link to="/login" className="navbar-button">
                <FontAwesomeIcon icon={faUserCircle} />
                <span className="">Login / Sign up</span>
              </Link>
            </li>
          ) : (
            <li className='relative' ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="navbar-button"
              >
                <FontAwesomeIcon icon={faUserCircle} />
                <span className="">User Dashboard</span>
              </button>
              {dropdownOpen && (
                <div className="absolute top-full mt-2 right-0 w-40 bg-white text-black shadow-lg rounded-md z-50">
                  <Link
                    to="/userDashboard"
                    className="block px-4 py-2 hover:bg-gray-200"
                    onClick={() => setDropdownOpen(false)}
                  >
                    User Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setShowLogoutModal(true);
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                  >
                    Logout
                  </button>

                </div>
              )}
            </li>
          )}
        </ul>
      </div>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
            <h2 className="text-2xl font-semibold mb-4 text-black">Are you sure you want to logout?</h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleLogout}
                
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        )}

    </nav>
  );
}

export default Navbar;
