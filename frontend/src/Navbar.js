// src/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';  // We'll use React Router for navigation
import './Navbar.css';  // Add the CSS file for sidebar styling

function Navbar () {
  return (
    <aside className="bg-cyan-950 w-64 h-full fixed">
      <nav className="p-5">
        <ul className="space-y-4 text-white">
          <li><Link to="/homepage" className="hover:text-blue-400">Homepage</Link></li>
          <li><Link to="/compare" className="hover:text-blue-400">Compare</Link></li>
          <li><Link to="/loginpage" className="hover:text-blue-400">Login/Create Account</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Navbar;
