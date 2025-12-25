import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Aurora from '@/components/Aurora';

export default function VanillaLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem('ai-study-pal-user');
    if (!userStr) {
      setStatus('No user registered. Please sign up first.');
      return;
    }
    const user = JSON.parse(userStr);
    if (email === user.email && password === user.password) {
      setStatus('Login successful! Redirecting...');
      // Store a flag to indicate logged in
      localStorage.setItem('ai-study-pal-logged-in', 'true');
      setTimeout(() => {
        navigate('/vanilla-dashboard');
      }, 1200);
    } else {
      setStatus('Invalid gmail address or password.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Aurora colorStops={["#FFFFFF", "#DAA520", "#000000"]} blend={0.8} amplitude={1.5} />
      <div className="absolute inset-0 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-card p-8 rounded shadow w-full max-w-md text-center z-10">
          <h1 className="text-2xl font-bold mb-4">Login to AI Study Pal</h1>
          <input
            type="email"
            placeholder="Enter gmail address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mb-3 w-full px-3 py-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mb-3 w-full px-3 py-2 border rounded"
            required
          />
          <button type="submit" className="w-full py-2 px-4 bg-primary text-white rounded font-semibold mb-4">
            Login
          </button>
          <div className="status text-red-500 mb-2">{status}</div>
          <p className="switch-link mt-4 text-sm">
            Not registered? <Link to="/vanilla-signup" className="text-primary underline font-semibold">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
