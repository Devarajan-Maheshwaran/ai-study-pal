import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import Aurora from './Aurora';
import NavLink from './ui/NavLink';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-screen bg-background text-text">
      <Aurora />
      <div className="flex h-screen">
        <aside className="flex w-64 flex-col border-r border-border bg-card/80 backdrop-blur">
          <div className="flex items-center gap-2 border-b border-border px-4 py-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-semibold">
              SP
            </span>
            <div>
              <h1 className="text-sm font-semibold text-text">AI Study Pal</h1>
              <p className="text-xs text-muted">Your smart study partner</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 text-sm">
            <NavLink to="/" label="Dashboard" />
            <NavLink to="/notes-to-mcqs" label="Notes → MCQs" />
            <NavLink to="/adaptive-quiz" label="Adaptive Quiz" />
            <NavLink to="/study-tips" label="Revision Summary" />
            <NavLink to="/resources" label="Resources" />
            <NavLink to="/settings" label="Settings" />
          </nav>
          <div className="border-t border-border px-4 py-3 text-xs text-muted">
            © {new Date().getFullYear()} AI Study Pal
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto bg-background/80">
          <header className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Capstone project</p>
              <p className="text-sm text-text">
                Built with Flask, React, and **AI**-powered helpers.
              </p>
            </div>
            <Link
              to="/settings"
              className="rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-primary hover:text-primary"
            >
              Student profile
            </Link>
          </header>
          <div className="px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;