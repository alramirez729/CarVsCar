import {React, useContext} from 'react';
import { Link } from 'react-router-dom';
import homePageIcon from './images/carvcar.JPG';
import { AuthContext } from '../AuthContext';

function Homepage() {

  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  return (
    <div className="flex rounded-lg flex-col items-center justify-center p-3 text-center font-mono">
      <h1 className="my-5 heading tracking-widest ring-1 ring-slate-300 bg-slate-200 rounded-l h-30 w-30 border-b-gray-300 border-2 p-5">
        Welcome to Car vs. Car!
      </h1>
      <img 
        src={homePageIcon} 
        alt="CarVsCar" 
        className="max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] mb-5 border-4 border-gray-300 rounded-lg object-contain"
      />
      <p className="text-left text-base font-medium md:text-xl lg:text-2xl text-slate-900 font-mono leading-relaxed max-w-xl mx-0 px-5">
        Two cars of your choice go head to head, see which one suites your needs using Car vs. Car! 
      </p>
      {!isLoggedIn &&
        <Link 
        to="/loginpage" 
        className="general-button-styling"
      >
        Sign up/login
      </Link>
      }
      
    </div>
  );
};

export default Homepage;
