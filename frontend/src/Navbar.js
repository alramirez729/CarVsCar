// src/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBalanceScale, faUser } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';  // Add the CSS file for sidebar styling

function Navbar () {

  return (
    <aside className="navbar-style">

      <nav className="p-5">
        <ul className="space-y-8">
          <li className="group relative">
            <Link to="/homepage" className="navbar-button-styling flex items-center space-x-4">
              <FontAwesomeIcon icon={faHome} size="3x" /> <div className="hidden lg:block">Homepage</div>
            </Link> 
            <span className="navbar-button-hover">Homepage</span>
          </li>
          <li className="group relative">
            <Link to="/compare" className="navbar-button-styling flex items-center space-x-4">
              <FontAwesomeIcon icon={faBalanceScale} size="3x" /> <div className="font-FS-font flex-grow hidden lg:block">Compare</div>
              </Link>
              <span className="navbar-button-hover">Compare</span>
          </li>
          <li className="group relative">
            <Link to="/loginpage" className="navbar-button-styling flex place-items-end space-x-4">
              <FontAwesomeIcon icon={faUser} size="3x" /><div className="hidden lg:block">Login/Sign up</div>
            </Link> 
            <span className="navbar-button-hover"> Login/Create Account</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Navbar;
