import { Link, Outlet, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/notes-to-mcqs', label: 'Notes→MCQs' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/revision', label: 'Revision' },
  { to: '/resources', label: 'Resources' },
  { to: '/settings', label: 'Settings' },
];

export default function Layout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-black to-black relative">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-700/40 via-black/80 to-black z-0" />
      <header className="w-full flex items-center px-6 py-4 bg-black/80 backdrop-blur shadow z-10 relative border-b border-yellow-900">
        <span className="font-bold text-2xl text-yellow-400 mr-8 tracking-tight">AI Study Pal</span>
        <nav className="flex gap-4">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-medium px-2 py-1 rounded transition-colors duration-200
                ${location.pathname === link.to ? 'bg-yellow-500 text-black' : 'text-yellow-200 hover:bg-yellow-800/60 hover:text-yellow-300'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="relative z-10 px-4 py-8 max-w-3xl mx-auto">
        <div className="rounded-xl bg-black/80 shadow-lg p-6 border border-yellow-900">
          <Outlet />
        </div>
      </main>
      <footer className="w-full text-center py-4 text-yellow-700 text-xs bg-black/80 border-t border-yellow-900 z-10 relative">
        © {new Date().getFullYear()} AI Study Pal
      </footer>
    </div>
  );
}

// removed duplicate default export
