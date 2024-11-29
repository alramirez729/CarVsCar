import React from 'react';
import { Link } from 'react-router-dom';
import homePageIcon from './images/carvcar.JPG';

function Homepage() {
  return (
    <div className="my-20 flex rounded-lg flex-col items-center justify-center p-3 text-center font-mono">
      <h1 className="text-4xl md:text-6xl lg:text-5xl font-bold text-gray-500 font-mono uppercase tracking-wide mb-5">
        Welcome to Car vs. Car!
      </h1>
      <img 
        src={homePageIcon} 
        alt="CarVsCar" 
        className="max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] mb-5 border-4 border-gray-300 rounded-lg object-contain"
      />
      <p className="text-base font-medium md:text-xl lg:text-2xl text-slate-900 font-mono leading-relaxed max-w-xl mx-auto px-5">
        Can't decide between one car or the other? That's where we come in... Compare two distinct cars and see which one is right for you!
      </p>
      <Link 
        to="/loginpage" 
        className="general-button-styling"
      >
        Sign up
      </Link>
    </div>
  );
};

export default Homepage;
