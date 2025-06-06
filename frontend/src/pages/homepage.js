import { React, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { Link } from 'react-router-dom';
import homePageIcon from './images/carvcar.JPG';

function Homepage() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <div className="flex flex-col items-center justify-center my-10 p-6 text-center font-sans">
      {/* Heading */}
      <h1 className="-mt-10 mb-6 my-10 bvtext-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tightopacity-0 animate-fade-in-up animation-delay-1000">
        <span className="text-blue-600 ">Compare Cars Instantly:</span>
      </h1>

      {/* Description */}
      <p className="italic text-base md:text-xl lg:text-2xl text-slate-700 font-medium max-w-2xl leading-relaxed mx-auto px-5opacity-0 animate-fade-in-up animation-delay-800">
        Two cars of your choice go head to head. See which one suits your needs using Car vs. Car!
      </p>

      {/* Call-to-Action Buttons */}
      <div className="flex flex-col space-y-4">
        <Link
          to="/compare"
          className="general-button-styling animate-fade-in bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors hover:animate-wiggle transition-all duration-300"
        >
          Try it now
        </Link>
        {!isLoggedIn && (
          <Link
            to="/login"
              className="general-button-styling animate-fade-in bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 hover:animate-wiggle transition-all duration-300"
          >
            Sign Up / Login
          </Link>
        )}
      </div>

      {/* Image */}
      <img
        src={homePageIcon}
        alt="CarVsCar"
        className="animate-fade-in my-10 max-w-[40vw] md:max-w-[30vw] lg:max-w-[60vw] mb-8 border-4 border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
      />      
    </div>
  );
}

export default Homepage;