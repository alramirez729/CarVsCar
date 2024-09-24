import React, { useState } from 'react';
import axios from 'axios';

function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3000/users/register', {
                name,
                email,
                password,
                age
            });
            setMessage(response.data.message);
            console.log('Registration successful:', response.data.user);
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
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input 
                            type="text" 
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                        <input 
                            type="number" 
                            id="age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            required
                            className="mt-1 px-3 py-2 border border-gray-300 rounded-lg w-full"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full py-2 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition duration-300"
                    >
                        Register
                    </button>
                </form>
                {message && <p className="mt-4 text-center text-red-500">{message}</p>}
            </div>
        </div>
    );
}

export default RegisterPage;
