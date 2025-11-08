import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      
      // Show success toast
      toast.success('Successfully logged in!');
      
      // Navigate to dashboard after successful login
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Login failed:', error?.response?.data || error.message);
      
      // Show error toast
      toast.error(error?.response?.data?.message || 'Login failed. Please try again.');
    }
  };


  return (


    <div className="h-screen relative bg-gradient-to-t from-blue-600 via-gray-400 to-gray-100 flex items-center justify-center text-gray-800 px-4">


      <div className="max-w-md z-10 w-full space-y-6 p-8  rounded-lg shadow-lg">
        <h2 className="text-center text-3xl font-bold mb-6">Let's start building</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-600 bg-transparent text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-600 bg-transparent text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-2 px-4 bg-blue-800 hover:bg-blue-900 text-white font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </button>
        </div>

        <p className="text-center font-bold text-sm text-gray-800">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-800 font-bold hover:text-blue-900 ">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
