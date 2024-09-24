// src/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBalanceScale, faUser } from '@fortawesome/free-solid-svg-icons';  // Import icons from Font Awesome
import './Navbar.css';  // Add the CSS file for sidebar styling

function Navbar () {
  return (
    <aside className="bg-cyan-950 w-64 h-full fixed flex items-center justify-center">
      <nav className="p-5">
        <ul className="space-y-8">
          <li className="group relative">
            <Link to="/homepage" className="block bg-cyan-700 text-white py-10 px-10 rounded-lg text-center hover:bg-cyan-500 transition duration-300 ease-in-out"
            >
              <FontAwesomeIcon icon={faHome} size="3x" />
            </Link>
            <span className="opacity-0 group-hover:opacity-100 absolute  italic top-1/2 left-3/4 transform -translate-y-1/2 bg-black text-white text-sm py-1 px-2 rounded-lg shadow-lg transition-opacity duration-300">
              Homepage
            </span>
          </li>
          <li className="group relative">
            <Link to="/compare" className="block bg-cyan-700 text-white py-10 px-10 rounded-lg text-center hover:bg-cyan-500 transition duration-300 ease-in-out"
            >
              <FontAwesomeIcon icon={faBalanceScale} size="3x" />
            </Link>
            <span className="opacity-0 group-hover:opacity-100 absolute italic top-1/2 left-3/4 transform -translate-y-1/2 bg-black text-white text-sm py-1 px-2 rounded-lg shadow-lg transition-opacity duration-300">
              Compare
            </span>
          </li>
          <li className="group relative">
            <Link to="/loginpage" className="block bg-cyan-700 text-white py-10 px-10 rounded-lg text-center hover:bg-cyan-500 transition duration-300 ease-in-out"
            >
              <FontAwesomeIcon icon={faUser} size="3x" />
            </Link>
            <span className="opacity-0 group-hover:opacity-100 absolute italic top-1/2 left-3/4 transform -translate-y-1/2 bg-black text-white text-sm py-1 px-2 rounded-lg shadow-lg transition-opacity duration-300">
              Login/Create Account
            </span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Navbar;
