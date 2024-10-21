import React from 'react';
import { Link } from 'react-router-dom';
import homePageIcon from './images/carvcar.JPG';

function Homepage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center max-w-[90vw] mx-auto font-oswald">
      <h1 className="text-4xl md:text-6xl lg:text-5xl font-bold text-white uppercase tracking-wide mb-5">
        Welcome to Car vs. Car!
      </h1>
      <img 
        src={homePageIcon} 
        alt="CarVsCar" 
        className="max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] mb-5 border-4 border-gray-300 rounded-lg object-contain"
      />
      <p className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed max-w-xl mx-auto px-5">
        Can't decide between one car or the other? That's where we come in... Compare two distinct cars and see which one is right for you!
      </p>
      <Link 
        to="/loginpage" 
        className="mt-8 bg-cyan-700 text-white py-3 px-4 rounded-lg hover:bg-cyan-500 transition duration-300 ease-in-out"
      >
        Sign up
      </Link>
    </div>
  );
};

export default Homepage;
