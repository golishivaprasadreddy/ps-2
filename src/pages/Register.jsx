
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { registerUser } from '../services/coinService';

const Register = () => {
	const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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
			const res = await registerUser({ name: form.name, email: form.email, password: form.password });
			if (res.data && res.data.message) {
				setMessage('Registration successful! 100 Vitacoins credited.');
			} else {
				setMessage(res.data.message || 'Error');
			}
		} catch (err) {
			setMessage(err.response?.data?.message || 'Server error');
		}
	};

	return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 px-2 py-8">
				<div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-lg border border-slate-200">
					<h1 className="text-4xl font-extrabold mb-6 text-center text-blue-700">Create Your Account</h1>
					<form onSubmit={handleSubmit} className="flex flex-col gap-6">
						<input
							type="text"
							name="name"
							placeholder="Full Name"
							value={form.name}
							onChange={handleChange}
							className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
							required
						/>
						<input
							type="email"
							name="email"
							placeholder="Email"
							value={form.email}
							onChange={handleChange}
							className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
							required
						/>
						<input
							type="password"
							name="password"
							placeholder="Password"
							value={form.password}
							onChange={handleChange}
							className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
							required
						/>
						<input
							type="password"
							name="confirmPassword"
							placeholder="Confirm Password"
							value={form.confirmPassword}
							onChange={handleChange}
							className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
							required
						/>
						<button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow">Register</button>
					</form>
							{message && (
								<div className="mt-6 text-center">
									<div className="inline-block px-6 py-4 bg-green-100 border-2 border-green-400 rounded-xl shadow animate-bounce">
										<span className="text-2xl font-bold text-green-700">{message}</span>
										<div className="mt-2 text-sm text-gray-700">Welcome to Vitaversity! Start earning coins by engaging with quizzes and forums.</div>
									</div>
								</div>
							)}
					<div className="mt-6 text-center">
						<span className="text-gray-700">Already have an account? </span>
						<button className="text-blue-600 underline font-bold" onClick={() => navigate('/login')}>Login</button>
					</div>
				</div>
			</div>
	);
};

export default Register;
