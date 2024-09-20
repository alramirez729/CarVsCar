// src/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';  // We'll use React Router for navigation
import './Navbar.css';  // Add the CSS file for sidebar styling

function Navbar () {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li><Link to="/homepage">Homepage</Link></li>
          <li><Link to="/compare">Compare</Link></li>
          <li><Link to="/loginpage">Login/Create Account</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Navbar;
