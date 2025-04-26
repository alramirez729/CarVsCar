import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

function RegisterPage() {
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setIsLoggedIn } = useContext(AuthContext);
    const [birthdate, setBirthdate] = useState('');
    const [message, setMessage] = useState('');
    const [showPreferencesPrompt, setShowPreferencesPrompt] = useState(false);
    const navigate = useNavigate(); // ⬅️ make sure this is at the top


    const handleRegister = async (e) => {
        e.preventDefault();
    
        try {
            const formattedBirthdate = birthdate ? new Date(birthdate).toISOString().split('T')[0] : null;
    
            const response = await axios.post('https://car-vs-car-api.onrender.com/users/register', {
                username,
                email,
                password,
                birthdate: formattedBirthdate
            });
    
            const { token, user, message } = response.data;
    
            if (!token) {
                console.error('Token was not returned from server.');
                setMessage('Account created, but automatic login failed. Please login manually.');
                navigate('/login');
                return; // 🛑 Exit early if no token
            }
    
            // 🔥 Save token and login
            localStorage.setItem('token', token);
            setIsLoggedIn(true);
    
            // ✅ Navigate directly to dashboard
            navigate('/userDashboard', { state: { showPreferences: true } });
    
            setMessage(message);
            setShowPreferencesPrompt(true);
    
            console.log('Registration successful:', user);
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage('Server error');
            }
            console.error(error);
        }
    };
    
    

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">user name</label>
                        <input 
                            type="text" 
                            id="username"
                            value={username}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                            className="mt-1 px-3 py-2 border border-gray-300 rounded-lg w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" 
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 px-3 py-2 border border-gray-300 rounded-lg w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input 
                            type="password" 
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 px-3 py-2 border border-gray-300 rounded-lg w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">Birthdate</label>
                        <input 
                            type="date"  
                            id="birthdate"
                            value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)}
                            required
                            className="mt-1 px-3 py-2 border border-gray-300 rounded-lg w-full cursor-pointer"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full py-2 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition duration-300"
                    >
                        Register
                    </button>
                </form>
                {showPreferencesPrompt && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md w-full">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Would you like to fill out your Car Preferences?
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            These will help us tailor AI Analysis in car comparisons. You can change them anytime in the dashboard.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                            onClick={() => navigate('/userDashboard')}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
                            >
                            Yes, go now
                            </button>
                            <button
                            onClick={() => navigate('/compare')}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                            >
                            Maybe later
                            </button>
                        </div>
                        </div>
                    </div>
                    )}

                {message && <p className="mt-4 text-center text-red-500">{message}</p>}
            </div>
        </div>
    );
}

export default RegisterPage;
