// src/Homepage.js
import React from 'react';
import './homepage.css';
import homePageIcon from './images/carvcar.JPG'

function Homepage() {
  return (
    <div>
      <div id="content">
        <h1>Welcome to Car vs. Car!</h1>
        <img src={homePageIcon} alt="CarVsCar" className="carvcar"></img>
        <p>Application that will make a comparison between different cars in order to determine which is best for a specific purpose.</p>
      </div>
    </div>
  );
};

export default Homepage;
