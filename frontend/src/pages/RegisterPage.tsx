import React, { useState } from 'react';
import Aurora from '@/components/Aurora';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.email || !form.password || !form.confirmPassword) {
      setError('Email and password are required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.email.endsWith('@gmail.com')) {
      setError('Please use a valid gmail address.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Registration successful! You can now log in.');
        setForm({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Aurora colorStops={["#FFFFFF", "#DAA520", "#000000"]} blend={0.8} amplitude={1.5} />
      <div className="absolute inset-0 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-card p-8 rounded shadow w-full max-w-md text-center z-10">
          <h1 className="text-2xl font-bold mb-4">Register for AI Study Pal</h1>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="mb-3 w-full px-3 py-2 border rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="mb-3 w-full px-3 py-2 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="mb-3 w-full px-3 py-2 border rounded"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="mb-3 w-full px-3 py-2 border rounded"
            required
          />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {success && <div className="text-green-500 mb-2">{success}</div>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary text-white rounded font-semibold mb-4"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          <div className="mt-4 text-sm">
            Already registered?{' '}
            <Link to="/login" className="text-primary underline font-semibold">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
