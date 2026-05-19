import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { CountUp } from '@/components/reactbits/CountUp';
import {
  FolderIcon, PlusIcon, CalendarIcon,
  ChevronRightIcon, CloseIcon, ArrowRightIcon,
} from '@/components/icons';
import { useWorkspaces, useCreateWorkspace } from '@/hooks/useWorkspace';

export default function WorkspaceListPage() {
  const navigate = useNavigate();
  const { data: workspaces, isLoading, isError } = useWorkspaces();
  const createMutation = useCreateWorkspace();

  const [showForm, setShowForm] = useState(false);
  const [name,     setName]     = useState('');
  const [subject,  setSubject]  = useState('');
  const [examDate, setExamDate] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate(
      { name: name.trim(), subject: subject || undefined, exam_date: examDate || undefined },
      {
        onSuccess: () => {
          setShowForm(false);
          setName('');
          setSubject('');
          setExamDate('');
        },
      },
    );
  }

  return (
    <div
      className="min-h-screen px-5 py-10"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="label-section mb-1">Study OS</p>
            <h1 className="font-syne text-3xl font-bold text-[var(--text-primary)]">Workspaces</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {workspaces?.length
                ? `${workspaces.length} workspace${workspaces.length > 1 ? 's' : ''} — pick one to continue`
                : 'Create your first workspace to get started'}
            </p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="btn-primary"
          >
            <PlusIcon size={16} />
            New workspace
          </button>
        </motion.div>

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0,   scale: 1 }}
              exit={{    opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl p-6"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <p className="font-syne font-semibold text-[var(--text-primary)]">New Workspace</p>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <CloseIcon size={17} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="label-section">Name *</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="GATE 2027 — CSE"
                    required
                    className="rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="label-section">Subject</label>
                  <input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Computer Science"
                    className="rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="label-section">Exam date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    className="rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      colorScheme: 'inherit',
                    }}
                  />
                </div>
                <div className="sm:col-span-3 flex gap-2">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="btn-primary text-sm"
                  >
                    {createMutation.isPending ? (
                      <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                      </svg>
                    ) : (
                      <PlusIcon size={15} />
                    )}
                    Create workspace
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">
                    Cancel
                  </button>
                </div>
                {createMutation.isError && (
                  <p className="sm:col-span-3 text-xs" style={{ color: '#dc2626' }}>
                    {createMutation.error?.message}
                  </p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-44 rounded-2xl skeleton"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div
            className="rounded-2xl p-5 text-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
          >
            Could not connect to backend. Make sure the Flask server is running on port 5000.
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && workspaces?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center gap-4"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}
            >
              <FolderIcon size={24} className="text-[var(--text-faint)]" />
            </div>
            <div>
              <p className="font-syne font-semibold text-[var(--text-primary)] mb-1">No workspaces yet</p>
              <p className="text-sm text-[var(--text-muted)] max-w-xs">
                Create a workspace to start uploading notes, generating quizzes, and tracking your exam readiness.
              </p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <PlusIcon size={15} /> Create your first workspace
            </button>
          </motion.div>
        )}

        {/* Workspace grid */}
        {!isLoading && !isError && (workspaces?.length ?? 0) > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces!.map((ws, i) => (
              <motion.div
                key={ws.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <SpotlightCard
                  className="p-5 h-full cursor-pointer group"
                  onClick={() => navigate(`/workspaces/${ws.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}
                    >
                      <FolderIcon size={17} className="text-[var(--text-primary)]" />
                    </div>
                    <span
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}
                    >
                      {ws.subject?.split(' ')[0] ?? 'General'}
                    </span>
                  </div>

                  <p className="font-syne font-semibold text-[var(--text-primary)] mb-1 leading-snug">
                    {ws.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mb-5">{ws.subject ?? 'No subject'}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-faint)]">
                      <CalendarIcon size={12} />
                      <span>{ws.exam_date ?? 'No exam date'}</span>
                    </div>
                    <ChevronRightIcon
                      size={15}
                      className="text-[var(--text-faint)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
