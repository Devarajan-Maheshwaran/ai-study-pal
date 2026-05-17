import { Link } from 'react-router-dom';
import { Plus, FolderOpen, Calendar } from 'lucide-react';
import PageShell from '@/components/forge/PageShell';
import PaperCard from '@/components/forge/PaperCard';
import EmptyState from '@/components/forge/EmptyState';

// Phase 1: static demo workspaces.
// Phase 2+: replace with useQuery hitting GET /api/workspaces
const DEMO_WORKSPACES = [
  {
    id: 'gate-2027-cse',
    name: 'GATE 2027 — CSE',
    subject: 'Computer Science & Engineering',
    examDate: 'Feb 2027',
    topicCount: 12,
    masteryPct: 0,
  },
  {
    id: 'thermodynamics-demo',
    name: 'Engineering Thermodynamics',
    subject: 'Mechanical / Core Engineering',
    examDate: 'Demo only',
    topicCount: 5,
    masteryPct: 0,
  },
];

export default function WorkspaceListPage() {
  return (
    <PageShell>
      <div className="page-wrap py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-label">study OS</p>
            <h1 className="text-2xl font-bold text-ink">Workspaces</h1>
          </div>
          {/* Phase 2: opens create workspace modal / POST /api/workspaces */}
          <button
            type="button"
            disabled
            title="Create workspace — wired in Phase 2"
            className="btn-ink opacity-40 cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            New workspace
          </button>
        </div>

        {/* List */}
        {DEMO_WORKSPACES.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="h-8 w-8" />}
            title="No workspaces yet"
            description="Create a workspace to start uploading notes, generating quizzes, and tracking your exam readiness."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_WORKSPACES.map((ws) => (
              <Link key={ws.id} to={`/workspaces/${ws.id}`}>
                <PaperCard interactive className="h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded border border-forge-rule text-ink-faint"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                    </div>
                    <span className="tag">{ws.subject.split(' ')[0]}</span>
                  </div>
                  <p className="text-sm font-semibold text-ink mb-1">{ws.name}</p>
                  <p className="text-xs text-ink-faint mb-4">{ws.subject}</p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-ink-ghost">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{ws.examDate}
                    </span>
                    <span>{ws.topicCount} topics</span>
                  </div>
                </PaperCard>
              </Link>
            ))}
          </div>
        )}

        <p className="text-xs text-ink-ghost font-mono">
          ✦ Create workspace & persistence wired in Phase 2 (Supabase Postgres)
        </p>
      </div>
    </PageShell>
  );
}
