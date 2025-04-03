import { React, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { Link } from 'react-router-dom';
import homePageIcon from './images/carvcar.JPG';

function Homepage() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <div className="flex flex-col items-center justify-center my-10 p-6 text-center font-sans">
      {/* Heading */}
      <h1 className="-mt-12 mb-6 text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
        <span className="text-blue-600">Car vs. Car</span>
      </h1>

      {/* Description */}
      <p className="italic text-base md:text-xl lg:text-2xl text-slate-700 font-medium max-w-2xl leading-relaxed mx-auto px-5">
        Two cars of your choice go head to head. See which one suits your needs using Car vs. Car!
      </p>

      {/* Call-to-Action Buttons */}
      <div className="flex flex-col space-y-4">
        <Link
          to="/compare"
          className="general-button-styling bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
        >
          Start Comparing
        </Link>
        {!isLoggedIn && (
          <Link
            to="/login"
            className="general-button-styling bg-slate-900 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-slate-700 transition-colors duration-300"
          >
            Sign Up / Login
          </Link>
        )}
      </div>

      {/* Image */}
      <img
        src={homePageIcon}
        alt="CarVsCar"
        className="my-10 max-w-[40vw] md:max-w-[30vw] lg:max-w-[60vw] mb-8 border-4 border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
      />      
    </div>
  );
}

export default Homepage;