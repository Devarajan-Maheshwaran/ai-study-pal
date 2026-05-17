import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Github } from 'lucide-react';

export default function TopNav() {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <header className="sticky top-0 z-30 rule-x bg-paper/90 backdrop-blur-sm">
      <div className="page-wrap flex h-12 items-center justify-between gap-4">
        {/* Wordmark */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-6 w-6 items-center justify-center rounded border border-forge-rule bg-ink text-paper text-[10px] font-mono font-bold tracking-tighter">
            SF
          </div>
          <span className="font-mono text-sm font-semibold tracking-tight text-ink">
            StudyForge
          </span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-3">
          {isLanding ? (
            <>
              <a
                href="https://github.com/Devarajan-Maheshwaran/ai-study-pal"
                target="_blank"
                rel="noreferrer"
                className="btn-outline py-1.5 text-xs"
              >
                <Github className="h-3.5 w-3.5" />
                Source
              </a>
              <Link to="/workspaces" className="btn-ink py-1.5 text-xs">
                <BookOpen className="h-3.5 w-3.5" />
                Open OS
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="dot-green" />
              <span className="text-[11px] font-mono text-ink-faint">alpha</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
