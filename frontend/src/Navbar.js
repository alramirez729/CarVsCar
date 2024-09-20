// src/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';  // We'll use React Router for navigation

function Navbar () {
  return (
    <nav className="navbar">
      <Link to="/homepage">Homepage</Link>
      <Link to="/compare">Compare</Link>
      <Link to="/loginpage">Login/Create Account</Link>
    </nav>
  );
};

export default Navbar;
