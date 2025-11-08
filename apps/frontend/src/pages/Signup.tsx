import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Signup: React.FC = () => {


   const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/auth/signup', {
        username: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast.success(response.data.message);
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response.data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-t from-blue-600 via-gray-400 to-gray-100 text-gray-800 px-4">
      <div className="max-w-md w-full p-8 rounded-lg shadow-lg space-y-6">
        <h2 className="text-center text-3xl font-bold">Welcome to <br /> ChatHub</h2>

        <div className="space-y-4 text-gray-800">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder='john'
              className="w-full px-3 py-2 border border-gray-600 bg-transparent rounded-md placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder='john@gmail.com'
              className="w-full px-3 py-2 border border-gray-600 bg-transparent rounded-md placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder='12345'
              className="w-full px-3 py-2 border border-gray-600 bg-transparent rounded-md placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder='12345'
              className="w-full px-3 py-2 border border-gray-600 bg-transparent rounded-md placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <button
            onClick={handleSignup}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
          >
            Sign Up
          </button>
        </div>

        <p className="text-center text-sm text-gray-800 font-bold t-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-900 font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
