// src/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCodeCompare, faUserCircle, faUsersRays, faUserAlt, faUserAstronaut, faUserCheck, faUserEdit, faUser } from '@fortawesome/free-solid-svg-icons';


function Navbar () {

  return (
    <aside className="navbar-style">

      <nav className="p-1">
        <ul className="space-y-8">
          <li className="group relative">
          <h1 className="text-4xl font-bold mb-5 text-center text-white font-mono">Car vs. Car</h1>
            <Link to="/homepage" className="navbar-button-styling flex items-center space-x-4">
              <FontAwesomeIcon icon={faHome} size="3x" /> <div className="font-mono text-xl flex-grow hidden lg:block">Homepage</div>
            </Link> 
            <span className="navbar-button-hover">Homepage</span>
          </li>
          <li className="group relative">
            <Link to="/compare" className="navbar-button-styling flex items-center space-x-4">
              <FontAwesomeIcon icon={faCodeCompare} size="3x" /> <div className="font-mono text-xl flex-grow hidden lg:block">Compare</div>
              </Link>
              <span className="navbar-button-hover">Compare</span>
          </li>
          <li className="group relative">
            <Link to="/loginpage" className="navbar-button-styling flex place-items-end space-x-4">
              <FontAwesomeIcon icon={faUserCircle} size="3x" /><div className="font-mono text-xl flex-grow hidden lg:block">Login/Sign up</div>
            </Link> 
            <span className="navbar-button-hover"> Login/Create Account</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Navbar;
