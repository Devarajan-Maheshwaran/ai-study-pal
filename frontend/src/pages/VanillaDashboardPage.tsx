import React, { useEffect } from 'react';
import Aurora from '@/components/Aurora';

export default function VanillaDashboardPage() {
  const userStr = localStorage.getItem('ai-study-pal-user');
  const loggedIn = localStorage.getItem('ai-study-pal-logged-in') === 'true';
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!loggedIn || !user) {
      window.location.href = '/vanilla-login';
    }
  }, [loggedIn, user]);

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Aurora colorStops={["#FFFFFF", "#DAA520", "#000000"]} blend={0.8} amplitude={1.5} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-card p-8 rounded shadow w-full max-w-md text-center z-10">
          <h1 className="text-2xl font-bold mb-4">Welcome to AI Study Pal!</h1>
          <p className="mb-4">You are logged in as <span className="font-semibold">{user?.email}</span></p>
          <button
            className="w-full py-2 px-4 bg-primary text-white rounded font-semibold"
            onClick={() => {
              localStorage.removeItem('ai-study-pal-user');
              localStorage.removeItem('ai-study-pal-logged-in');
              window.location.href = '/vanilla-login';
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
