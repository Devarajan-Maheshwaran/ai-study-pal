import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Aurora from '@/components/Aurora';

export default function VanillaSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith('@gmail.com')) {
      setStatus('Please use a valid gmail address.');
      return;
    }
    if (password.length < 6) {
      setStatus('Password must be at least 6 characters.');
      return;
    }
    localStorage.setItem('ai-study-pal-user', JSON.stringify({ email, password }));
    localStorage.setItem('ai-study-pal-logged-in', 'true');
    setStatus('Signup successful! Redirecting to dashboard...');
    setTimeout(() => {
      window.location.href = '/vanilla-dashboard';
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Aurora colorStops={["#FFFFFF", "#DAA520", "#000000"]} blend={0.8} amplitude={1.5} />
      <div className="absolute inset-0 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-card p-8 rounded shadow w-full max-w-md text-center z-10">
          <h1 className="text-2xl font-bold mb-4">Sign Up for AI Study Pal</h1>
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
            placeholder="Create password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mb-3 w-full px-3 py-2 border rounded"
            required
          />
          <button type="submit" className="w-full py-2 px-4 bg-primary text-white rounded font-semibold mb-4">
            Sign Up
          </button>
          <div className="status text-green-600 mb-2">{status}</div>
          <p className="switch-link mt-4 text-sm">
            Already registered? <Link to="/vanilla-login" className="text-primary underline font-semibold">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
