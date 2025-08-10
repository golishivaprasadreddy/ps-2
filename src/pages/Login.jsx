import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/coinService';

const Login = () => {
	const [form, setForm] = useState({ email: '', password: '' });
	const [message, setMessage] = useState('');
	const navigate = useNavigate();

	const handleChange = e => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setMessage('');
		try {
			const res = await loginUser(form);
			if (res.data && res.data.token && res.data.user) {
				setMessage('Login successful!');
				// Save token and user info for dashboard usage
				localStorage.setItem('token', res.data.token);
				localStorage.setItem('userId', res.data.user._id);
				setTimeout(() => navigate('/dashboard'), 1500);
			} else {
				setMessage(res.data.message || 'Error');
			}
		} catch (err) {
			setMessage(err.response?.data?.message || 'Server error');
		}
	};

	return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-200 px-2 py-8">
				<div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-lg border border-slate-200">
					<h1 className="text-4xl font-extrabold mb-6 text-center text-purple-700">Login to Vitaversity</h1>
					<form onSubmit={handleSubmit} className="flex flex-col gap-6">
						<input
							type="email"
							name="email"
							placeholder="Email"
							value={form.email}
							onChange={handleChange}
							className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
							required
						/>
						<input
							type="password"
							name="password"
							placeholder="Password"
							value={form.password}
							onChange={handleChange}
							className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
							required
						/>
						<button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-purple-700 transition shadow">Login</button>
					</form>
					{message && <div className="mt-6 text-center text-green-600 font-semibold text-lg">{message}</div>}
					<div className="mt-6 text-center">
						<span className="text-gray-700">Don't have an account? </span>
						<button className="text-purple-600 underline font-bold" onClick={() => navigate('/register')}>Register</button>
					</div>
				</div>
			</div>
	);
};

export default Login;
