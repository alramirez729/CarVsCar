// src/Homepage.js
import React from 'react';
import homePageIcon from './images/carvcar.JPG'

function Homepage() {
  return (
    <div>
      <div id="content">
        <h1>Welcome to the Homepage</h1>
        <img src={homePageIcon} alt="CarVsCar" className="carvcar"></img>
        <p>This is the homepage of CarVsCar Webapp.</p>
      </div>
    </div>
  );
};

export default Homepage;
