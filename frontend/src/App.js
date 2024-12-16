import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from './AuthContext'; // Import AuthProvider
import './App.css'; // Make sure Tailwind is loaded here

// Importing components to the website
import Navbar from './Navbar';
import Compare from './pages/compare';
import Homepage from './pages/homepage';
import Loginpage from './pages/loginpage';
import Registerpage from './pages/registerPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex bg-white my-10">
          <Navbar />  {/* This will display the Navbar on all pages */}
          <div className="ml-64 p-5 w-full"> {/* Adds margin to avoid overlapping with the fixed sidebar */}
            <Routes>
              <Route path="/" element={<Homepage />} />  {/* Default route */}
              <Route path="/homepage" element={<Homepage />} />  
              <Route path="/compare" element={<Compare />} />
              <Route path="/loginpage" element={<Loginpage />} />
              <Route path="/register" element= {<Registerpage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
