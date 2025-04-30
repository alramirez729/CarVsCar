import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import UserPreferencesForm from './UserPreferencesForm'; // ⬅️ Import your form!

function RegisterPage() {
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setIsLoggedIn } = useContext(AuthContext);
    const [birthdate, setBirthdate] = useState('');
    const [message, setMessage] = useState('');
    const [preferences, setPreferences] = useState(null); // 🆕 Store locally entered preferences
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const formattedBirthdate = birthdate ? new Date(birthdate).toISOString().split('T')[0] : null;

            const response = await axios.post('https://car-vs-car-api.onrender.com/users/register', {
                username,
                email,
                password,
                birthdate: formattedBirthdate,
            });

            const { token, user, message } = response.data;

            if (!token) {
                setMessage('Account created, but automatic login failed. Please login manually.');
                navigate('/login');
                return;
            }

            localStorage.setItem('token', token);
            setIsLoggedIn(true);

            // 🆕 If user filled preferences, immediately save them
            if (preferences) {
                await axios.put('https://car-vs-car-api.onrender.com/users/preferences', preferences, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            // Redirect to compare.js after
            navigate('/compare', { state: { showPreferences: !preferences } }); // If they skipped, prompt later
            setMessage(message);

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
                   {/* 🆕 Button to open modal */}
                   <div className="text-right">
                        <button type="button" onClick={() => setShowPreferencesModal(true)} className="text-blue-500 underline">
                            (Optional) Fill Car Preferences
                        </button>
                    </div>

                    <button type="submit" className="w-full py-2 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition duration-300">
                        Register
                    </button>
                </form>

                {message && <p className="mt-4 text-center text-red-500">{message}</p>}
            </div>

            {/* 🆕 Preferences Modal */}
            {showPreferencesModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                        <h2 className="text-xl font-bold mb-4">Your Preferences</h2>
                        <UserPreferencesForm mode="embedded" onSave={(data) => { setPreferences(data); setShowPreferencesModal(false); }} />
                        <button onClick={() => setShowPreferencesModal(false)} className="mt-4 text-gray-500 hover:text-gray-700">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RegisterPage;
