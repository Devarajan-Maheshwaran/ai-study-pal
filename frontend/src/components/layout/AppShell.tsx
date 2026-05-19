import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

/**
 * Full-app shell: fixed sidebar on desktop, topbar + drawer on mobile.
 * Main content is offset by the sidebar width on desktop,
 * and has top padding on mobile to clear the topbar.
 */
export function AppShell() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main
        className="md:pl-[var(--sidebar-w)] pt-14 md:pt-0 min-h-screen"
      >
        <Outlet />
      </main>
    </div>
  );
}
