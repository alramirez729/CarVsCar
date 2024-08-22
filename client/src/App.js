import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Importing components to the website
import Navbar from './Navbar';
import Compare from './pages/compare';
import Homepage from './pages/homepage';
import Loginpage from './pages/loginpage';

function App() {
  return (
    <Router>
      <Navbar />  {/* This will display the Navbar on all pages */}
      <Routes>
        <Route path="/" element={<Homepage />} />  {/* Default route */}
        <Route path="/homepage" element={<Homepage />} />  
        <Route path="/compare" element={<Compare />} />
        <Route path="/loginpage" element={<Loginpage />} />
      </Routes>
    </Router>
  );
}

export default App;
