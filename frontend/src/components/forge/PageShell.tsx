import { ReactNode } from 'react';
import TopNav from './TopNav';

interface PageShellProps {
  children: ReactNode;
  className?: string;
  noNav?: boolean;
}

export default function PageShell({ children, className = '', noNav = false }: PageShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {!noNav && <TopNav />}
      <main className={`flex-1 ${className}`}>{children}</main>
    </div>
  );
}
