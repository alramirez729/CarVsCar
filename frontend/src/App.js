import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from './AuthContext'; // Import AuthProvider
import './App.css'; // Make sure Tailwind is loaded here

// Importing components to the website
import Navbar from './components/Navbar.js';
import Compare from './pages/compare';
import Homepage from './pages/homepage';
import Loginpage from './pages/loginpage';
import Registerpage from './pages/registerPage';
import AccountPage from './pages/accountPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex bg-white my-10">
          <Navbar />  {/* This will display the Navbar on all pages */}
          <div className="ml-center p-5 w-full"> {/* Adds margin to avoid overlapping with the fixed sidebar */}
            <Routes>
              <Route path="/" element={<Homepage />} />  {/* Default route */}
              <Route path="/homepage" element={<Homepage />} />  
              <Route path="/compare" element={<Compare />} />
              <Route path="/login" element={<Loginpage />} />
              <Route path="/register" element= {<Registerpage />} />
              <Route path="/account" element={<AccountPage />} />

            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
