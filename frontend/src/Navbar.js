import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCodeCompare, faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from './AuthContext';

function Navbar() {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  const handleLogout = () => {
    setIsLoggedIn(false);
    console.log('User logged out');
  };

  return (
    <nav className="bg-gray-800 text-white w-full py-4 shadow-lg fixed top-0 left-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-6">
        {/* Brand / Logo */}
        <Link to="/" className="text-2xl font-bold font-mono tracking-wide hover:scale-125 transition duration-300">
          Car vs. Car
        </Link>

        {/* Navigation Links */}
        <ul className="flex items-center space-x-8">
          <li>
            <Link to="/homepage" className="hover:text-cyan-400 hover:scale-125 transition duration-300 flex items-center space-x-2">
              <FontAwesomeIcon icon={faHome} />
              <span className="hidden sm:block font-mono hover:scale-105">Homepage</span>
            </Link>
          </li>
          <li>
            <Link to="/compare" className="hover:text-cyan-400 hover:scale-125 transition duration-300 flex items-center space-x-2">
              <FontAwesomeIcon icon={faCodeCompare} />
              <span className="hidden sm:block font-mono hover:scale-105">Compare</span>
            </Link>
          </li>
          {!isLoggedIn ? (
            <li>
              <Link to="/loginpage" className="hover:text-cyan-400 hover:scale-125 transition duration-300 flex items-center space-x-2">
                <FontAwesomeIcon icon={faUserCircle} />
                <span className="hidden sm:block font-mono hover:scale-105">Login / Sign up</span>
              </Link>
            </li>
          ) : (
            <li>
              <button
                onClick={handleLogout}
                className="hover:text-cyan-400 transition hover:scale-125 duration-300 flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span className="hidden sm:block font-mono hover:scale-105">Logout</span>
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
