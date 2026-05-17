import { BarChart3, Target, Zap, BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import PaperCard from '@/components/forge/PaperCard';
import ProgressRing from '@/components/forge/ProgressRing';

export default function WorkspaceDashboardPage() {
  const { id } = useParams();

  const quickLinks = [
    { label: 'Study material',  path: 'material',   icon: BookOpen },
    { label: 'Quiz arena',      path: 'quiz',        icon: Target },
    { label: 'Flashcards',      path: 'flashcards',  icon: Zap },
    { label: 'Copilot',         path: 'copilot',     icon: BarChart3 },
    { label: 'Analytics',       path: 'analytics',   icon: BarChart3 },
    { label: 'Planner',         path: 'planner',     icon: Calendar },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <PaperCard className="flex items-center gap-4">
          <ProgressRing value={0} label="mastery" />
          <div>
            <p className="section-label">overall mastery</p>
            <p className="text-xs text-ink-faint mt-0.5">
              Wired after first quiz attempt
            </p>
          </div>
        </PaperCard>

        <PaperCard>
          <p className="section-label mb-1">exam countdown</p>
          <p className="text-2xl font-bold font-mono text-ink">— days</p>
          <p className="text-xs text-ink-faint mt-1">Set exam date to activate planner</p>
        </PaperCard>

        <PaperCard>
          <p className="section-label mb-1">weak topics</p>
          <p className="text-sm text-ink-faint">
            Upload study material to detect weak topics via the ML analytics pipeline.
          </p>
        </PaperCard>
      </div>

      {/* Today's plan placeholder */}
      <PaperCard>
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">today's study plan</p>
          <Link to={`/workspaces/${id}/planner`} className="btn-outline py-1 text-xs">
            Open planner <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <p className="text-xs text-ink-faint">
          Phase 3 — the planner will generate a daily plan using the Study Time Optimizer
          and Concept Difficulty Ranker (NB07 / NB08) from your ML notebooks.
        </p>
      </PaperCard>

      {/* Quick nav */}
      <div>
        <p className="section-label mb-3">navigate workspace</p>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
          {quickLinks.map(({ label, path, icon: Icon }) => (
            <Link key={path} to={`/workspaces/${id}/${path}`}>
              <PaperCard interactive className="flex items-center gap-2 !p-3">
                <Icon className="h-4 w-4 text-ink-faint" />
                <span className="text-xs font-medium text-ink">{label}</span>
              </PaperCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
