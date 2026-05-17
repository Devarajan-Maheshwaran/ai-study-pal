import { Link } from 'react-router-dom';
import PageShell from '@/components/forge/PageShell';

export default function NotFound() {
  return (
    <PageShell>
      <div className="page-wrap flex flex-col items-center justify-center py-32 text-center">
        <p className="font-mono text-6xl font-bold text-forge-rule mb-4">404</p>
        <p className="text-sm font-medium text-ink mb-2">Page not found</p>
        <p className="text-xs text-ink-faint mb-8">This route doesn't exist in the study OS.</p>
        <Link to="/" className="btn-ink text-xs">
          Back to home
        </Link>
      </div>
    </PageShell>
  );
}
