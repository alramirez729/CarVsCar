import React, { useState, useContext } from 'react';
import { Link , useNavigate} from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext'; // Import AuthContext

function LoginPage() {
    const { setIsLoggedIn } = useContext(AuthContext); // Access setIsLoggedIn from context
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate('');

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log('Submitting login with:', { email, password });
      
        try {
          const response = await axios.post('http://localhost:3000/users/login', { email, password });
          console.log('Login response:', response.data);
      
          const { token, message } = response.data;
          setMessage(message);
      
          if (token) {
            localStorage.setItem('token', token);
            setIsLoggedIn(true);
            navigate('/compare');
          } else {
            setMessage('Login failed: No token received');
          }
        } catch (error) {
          if (error.response) {
            console.error('Login error response:', error.response.data);
            setMessage(error.response.data.message);
          } else {
            console.error('Login server error:', error);
            setMessage('Server error');
          }
        }
      };
      
    

    return (
        <div className="min-h-screen flex flex-col justify-center items-center">
            <div className="bg-slate-200 p-8 rounded-lg shadow-xl max-w-md w-full ring-1 ring-slate-500">
                <h1 className="title">Login</h1>
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
                {message && <p className="font-mono mt-4 text-center font-medium text-blue-400">{message}!</p>}
                <p className="font-mono mt-6 text-center">
                    Don't have an account? <Link to="/register" className="font-mono text-cyan-600 hover:underline">Register here</Link>.
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
