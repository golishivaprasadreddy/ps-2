import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/coinService';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');

    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      // ✅ send only name, email, password
      const res = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      if (res.data && res.data.message) {
        setMessage(res.data.message);
      } else {
        setMessage('Registration successful!');
      }

      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 px-2 py-8">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg border border-slate-200 animate__animated animate__fadeIn">
        <h1 className="text-5xl font-extrabold mb-6 text-center text-indigo-700 drop-shadow">
          Create Your Account 🚀
        </h1>

        <div className="mb-4 text-center text-xs text-slate-500">
          <span className="font-semibold">API Endpoint:</span>{' '}
          <span className="bg-slate-100 px-2 py-1 rounded">/api/auth/register</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg w-full"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={form.email}
              onChange={handleChange}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg w-full"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg w-full"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg w-full"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 transition shadow-lg animate__animated animate__pulse"
          >
            Register
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className="mt-6 text-center">
            <div
              className={`inline-block px-6 py-4 rounded-xl shadow animate-bounce animate__animated animate__fadeIn ${
                message.toLowerCase().includes('success')
                  ? 'bg-green-100 border-2 border-green-400'
                  : 'bg-red-100 border-2 border-red-400'
              }`}
            >
              <span
                className={`text-2xl font-bold ${
                  message.toLowerCase().includes('success') ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {message}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              Welcome to Vitaversity! Earn badges and achievements by completing quizzes, courses, and participating in the forum. Your progress and badges will be displayed on your dashboard.
            </div>
          </div>
        )}

        {/* Redirect */}
        <div className="mt-6 text-center">
          <span className="text-gray-700">Already have an account? </span>
          <button
            className="text-indigo-600 underline font-bold"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
