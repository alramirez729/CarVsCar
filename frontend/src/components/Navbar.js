import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCodeCompare, faSearch } from '@fortawesome/free-solid-svg-icons';


function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-gray-800 text-white w-full py-4 shadow-lg fixed top-0 left-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-6">
        {/* Brand / Logo */}
        <Link to="/" className="text-2xl font-bold font-sans tracking-wide hover:scale-125 transition duration-300">
          Car vs. Car
        </Link>

        {/* Navigation Links */}
        <ul className="flex items-center space-x-8">
          
          <li>
            <Link 
            to="/homepage" 
            className={`navbar-button ${
                  location.pathname === "/homepage" ? "navbar-button-current-page" : ""
                }`}
              >
              <FontAwesomeIcon icon={faHome} />
              <span className="navbar-icon">Home</span>
            </Link>
          </li>
          <li>
            <Link to="/searchVehicles" className="hover:text-cyan-400 hover:scale-125 transition duration-300 flex items-center space-x-2">
              <FontAwesomeIcon icon={faSearch}/>
              <span className="navbar-icon">Search</span>
            </Link>
            
          </li>
          <li>
            <Link to="/compare" className={`navbar-button ${location.pathname === "/compare" ? "navbar-button-current-page" : ""}`}
  >
              <FontAwesomeIcon icon={faCodeCompare} />
              <span className="navbar-icon">Compare</span>
            </Link>
          </li>
          {/* login/logout commented out for POC */}
        </ul>
      </div>
      {/* logout modal commented out for POC */}

    </nav>
  );
}

export default Navbar;
