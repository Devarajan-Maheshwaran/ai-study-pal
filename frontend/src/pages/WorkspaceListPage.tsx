import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen, Calendar, Loader2, AlertCircle } from 'lucide-react';
import PageShell from '@/components/forge/PageShell';
import PaperCard from '@/components/forge/PaperCard';
import EmptyState from '@/components/forge/EmptyState';
import { useWorkspaces, useCreateWorkspace } from '@/hooks/useWorkspace';

export default function WorkspaceListPage() {
  const { data: workspaces, isLoading, isError } = useWorkspaces();
  const createMutation = useCreateWorkspace();

  const [showForm, setShowForm] = useState(false);
  const [name, setName]         = useState('');
  const [subject, setSubject]   = useState('');
  const [examDate, setExamDate] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate(
      { name: name.trim(), subject: subject || undefined, exam_date: examDate || undefined },
      { onSuccess: () => { setShowForm(false); setName(''); setSubject(''); setExamDate(''); } },
    );
  }

  return (
    <PageShell>
      <div className="page-wrap py-10 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-label">study OS</p>
            <h1 className="text-2xl font-bold text-ink">Workspaces</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(v => !v)}
            className="btn-ink"
          >
            <Plus className="h-4 w-4" />
            New workspace
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <PaperCard className="animate-scale-in">
            <p className="section-label mb-3">new workspace</p>
            <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono text-ink-faint">Name *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="GATE 2027 — CSE"
                  className="rounded-md border border-forge-rule bg-paper px-3 py-2 text-sm text-ink placeholder-ink-ghost outline-none focus:ring-2 focus:ring-ink/15"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono text-ink-faint">Subject</label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Computer Science"
                  className="rounded-md border border-forge-rule bg-paper px-3 py-2 text-sm text-ink placeholder-ink-ghost outline-none focus:ring-2 focus:ring-ink/15"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono text-ink-faint">Exam date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="rounded-md border border-forge-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-ink/15"
                />
              </div>
              <div className="sm:col-span-3 flex gap-2">
                <button type="submit" disabled={createMutation.isPending} className="btn-ink text-xs">
                  {createMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Create workspace'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-xs">Cancel</button>
              </div>
              {createMutation.isError && (
                <p className="sm:col-span-3 text-xs text-status-red flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />{createMutation.error?.message}
                </p>
              )}
            </form>
          </PaperCard>
        )}

        {/* List */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-ink-faint">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading workspaces…
          </div>
        )}
        {isError && (
          <PaperCard className="flex items-center gap-2 text-sm text-status-red">
            <AlertCircle className="h-4 w-4" /> Could not connect to backend. Start Flask server on port 5000.
          </PaperCard>
        )}
        {!isLoading && !isError && workspaces?.length === 0 && (
          <EmptyState
            icon={<FolderOpen className="h-8 w-8" />}
            title="No workspaces yet"
            description="Create a workspace to start uploading notes, generating quizzes, and tracking your exam readiness."
          />
        )}
        {!isLoading && !isError && (workspaces?.length ?? 0) > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces!.map(ws => (
              <Link key={ws.id} to={`/workspaces/${ws.id}`}>
                <PaperCard interactive className="h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded border border-forge-rule text-ink-faint">
                      <FolderOpen className="h-3.5 w-3.5" />
                    </div>
                    <span className="tag">{ws.subject?.split(' ')[0] ?? 'General'}</span>
                  </div>
                  <p className="text-sm font-semibold text-ink mb-1">{ws.name}</p>
                  <p className="text-xs text-ink-faint mb-4">{ws.subject}</p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-ink-ghost">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{ws.exam_date ?? '—'}</span>
                  </div>
                </PaperCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
