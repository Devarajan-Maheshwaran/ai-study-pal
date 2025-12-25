import React, { useState } from 'react';
import Aurora from '@/components/Aurora';
import { Link, useNavigate } from 'react-router-dom';


export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Aurora colorStops={["#FFFFFF", "#DAA520", "#000000"]} blend={0.8} amplitude={1.5} />
      <div className="absolute inset-0 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-card p-8 rounded shadow w-full max-w-md text-center z-10">
          <h1 className="text-2xl font-bold mb-4">Sign in to AI Study Pal</h1>
          <input
            type="email"
            name="email"
            placeholder="Enter gmail address"
            value={form.email}
            onChange={handleChange}
            className="mb-3 w-full px-3 py-2 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={form.password}
            onChange={handleChange}
            className="mb-3 w-full px-3 py-2 border rounded"
            required
          />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary text-white rounded font-semibold mb-4"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <button
            type="button"
            className="w-full py-2 px-4 bg-secondary text-black rounded font-semibold mb-4"
            onClick={() => window.location.href = '/api/auth/google'}
          >
            Sign in with Google
          </button>
          <div className="mt-4 text-sm">
            Not registered?{' '}
            <Link to="/register" className="text-primary underline font-semibold">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
