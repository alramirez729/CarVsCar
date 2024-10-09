// src/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBalanceScale, faUser } from '@fortawesome/free-solid-svg-icons';  // Import icons from Font Awesome
import './Navbar.css';  // Add the CSS file for sidebar styling

function Navbar () {
  return (
    <aside className="navbar-style">
      <nav className="p-5">
        <ul className="space-y-8">
          <li className="group relative">
            <Link to="/homepage" className="navbar-button-styling">
              <FontAwesomeIcon icon={faHome} size="3x" />
            </Link> <span className="navbar-button-hover">Homepage</span>
          </li>
          <li className="group relative">
            <Link to="/compare" className="navbar-button-styling">
              <FontAwesomeIcon icon={faBalanceScale} size="3x" />
              </Link><span className="navbar-button-hover">Compare</span>
          </li>
          <li className="group relative">
            <Link to="/loginpage" className="navbar-button-styling">
              <FontAwesomeIcon icon={faUser} size="3x" />
            </Link> <span className="navbar-button-hover"> Login/Create Account</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Navbar;
