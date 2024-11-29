import React, { useState } from 'react';
import { Link } from 'react-router-dom';  // Import Link for navigation
import axios from 'axios';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // Update the API URL to the correct endpoint
            const response = await axios.post('http://localhost:3000/users/login', { email, password });
            setMessage(response.data.message);
            console.log('Login successful:', response.data.user);
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
        <div className="min-h-screen flex flex-col justify-center items-center">
            <div className="bg-slate-200 p-8 rounded-lg shadow-xl max-w-md w-full ring-1 ring-slate-500">
                <h1 className="text-2xl font-bold font-mono tracking-wider mb-6 text-center">Login</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="font-mono block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" 
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className=" mt-1 px-3 py-2 border border-gray-300 rounded-lg w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="font-mono block text-sm font-medium text-gray-700">Password</label>
                        <input 
                            type="password" 
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 px-3 py-2 border border-gray-300 rounded-lg w-full"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="font-mono w-full py-2 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition duration-300"
                    >
                        Login
                    </button>
                </form>
                {message && <p className="font-mono mt-4 text-center text-red-500">{message}</p>}
                <p className="font-mono mt-6 text-center">
                    Don't have an account? <Link to="/register" className="font-mono text-cyan-600 hover:underline">Register here</Link>.
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
