import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import {
  SunIcon, MoonIcon, ChevronRightIcon, ArrowRightIcon,
  BookIcon, BrainIcon, FlashIcon, ChartIcon,
  CalendarIcon, ChatIcon, FolderIcon, UploadIcon, DocsIcon,
} from '@/components/icons';

const sections = [
  {
    id: 'overview',
    label: 'Overview',
    icon: DocsIcon,
    content: {
      title: 'What is StudyPal?',
      body: [
        'StudyPal is an open-source AI study companion that helps you learn from your own material — not from pre-built content or external databases. Everything stays in your workspace.',
        'The system is built around five core tools: Quiz Arena, Smart Flashcards, AI Copilot, Analytics, and the Study Planner. Each one works from the documents you upload.',
        'StudyPal runs on a React + TypeScript frontend, a Python Flask backend, and uses ChromaDB for vector search and Supabase for persistent storage. You can self-host the backend or deploy to Railway with one click.',
      ],
    },
  },
  {
    id: 'workspaces',
    label: 'Workspaces',
    icon: FolderIcon,
    content: {
      title: 'Workspaces',
      body: [
        'A workspace is a self-contained study environment. Everything inside — materials, quizzes, flashcards, analytics — belongs to that workspace and does not bleed into others.',
        'Create one workspace per subject, course, or exam. You can have as many as you need. Each workspace shows a summary card on the Workspaces page with recent activity and quiz stats.',
        'To delete a workspace, open it, navigate to the Dashboard, and use the settings menu. Deletion is permanent and removes all associated vectors from ChromaDB.',
      ],
    },
  },
  {
    id: 'materials',
    label: 'Study Materials',
    icon: UploadIcon,
    content: {
      title: 'Uploading Study Material',
      body: [
        'Three input types are supported: plain text paste, PDF upload, and YouTube video URL. Each goes through an extraction pipeline before being stored.',
        'PDFs are parsed page-by-page. YouTube URLs are transcribed using the video transcript API. Plain text is chunked directly. All content is split into overlapping chunks and embedded into ChromaDB for semantic search.',
        'After upload, the material appears in your document list. You can view a summary, delete it, or use it immediately to generate a quiz or flashcard deck.',
      ],
    },
  },
  {
    id: 'quiz',
    label: 'Quiz Arena',
    icon: FlashIcon,
    content: {
      title: 'Quiz Arena',
      body: [
        'Quiz Arena generates multiple-choice questions from your uploaded material. Select a document (or use all documents in the workspace), set the number of questions, and click Generate.',
        'Each question has four options with exactly one correct answer. Questions are seeded from the most relevant chunks for the topic you select. You can also let the system choose topics automatically.',
        'After completing a quiz, you see a full results breakdown: score, time taken, per-question review, and which topics need more work. All results are saved and feed into Analytics.',
      ],
    },
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    icon: BookIcon,
    content: {
      title: 'Smart Flashcards',
      body: [
        'Flashcards are generated from your material with a front (question or term) and back (answer or definition). The SM-2 spaced-repetition algorithm schedules each card for review at the optimal interval.',
        'During a session, rate each card as Easy, Good, or Hard. The algorithm adjusts the next review date accordingly. Cards due today are always shown first.',
        'You can manually add cards, edit existing ones, or delete cards you have mastered. The deck resets only if you explicitly clear the progress.',
      ],
    },
  },
  {
    id: 'copilot',
    label: 'AI Copilot',
    icon: BrainIcon,
    content: {
      title: 'AI Copilot',
      body: [
        'The AI Copilot answers questions strictly from your uploaded material. It performs a semantic search over your workspace vectors, retrieves the most relevant chunks, and generates a grounded answer.',
        'Because the answer is always grounded in your content, the copilot will say it does not know if the question falls outside your documents. This prevents hallucination from external knowledge.',
        'The copilot supports multi-turn conversation within a session. Each new message includes the previous context so you can follow up on previous answers naturally.',
      ],
    },
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: ChartIcon,
    content: {
      title: 'Analytics',
      body: [
        'Analytics aggregates all your quiz results inside a workspace into a performance dashboard. You see a score trend over time, a breakdown by topic, and a list of questions you have answered incorrectly more than once.',
        'The exam readiness score is a weighted average of your recent performance, adjusted for the difficulty of topics you have covered. It is a directional indicator, not a precise prediction.',
        'All data is workspace-scoped. Resetting a workspace clears its analytics history.',
      ],
    },
  },
  {
    id: 'planner',
    label: 'Study Planner',
    icon: CalendarIcon,
    content: {
      title: 'Study Planner',
      body: [
        'The Planner generates a day-by-day study schedule from your target exam date, available daily study hours, and current analytics data.',
        'Topics where your quiz performance is weakest are allocated more time. Topics where you consistently score above 80% are given lighter review slots.',
        'The schedule is regenerated each time you open the Planner, reflecting your latest quiz results. It is a guide — you are free to reorder or skip sessions.',
      ],
    },
  },
  {
    id: 'deployment',
    label: 'Deployment',
    icon: ChatIcon,
    content: {
      title: 'Deploying StudyPal',
      body: [
        'The frontend deploys to Vercel with zero configuration. Push to main and Vercel picks it up automatically. The vercel.json in the repo configures the SPA rewrite rule so React Router works correctly.',
        'The backend deploys to Railway. Connect your GitHub repo, set the environment variables listed in backend/.env.example, and Railway will use the Procfile to start the Flask server.',
        'Supabase provides the PostgreSQL database. Create a free project, run the migration SQL from backend/db/schema.sql, and add the connection string to Railway as DATABASE_URL. ChromaDB runs in-process inside the Railway container and persists to disk between deploys as long as you keep the volume mounted.',
      ],
    },
  },
];

export default function DocsPage() {
  const navigate          = useNavigate();
  const { theme, toggle } = useTheme();
  const [active, setActive] = useState('overview');

  const current = sections.find(s => s.id === active)!;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col">

      {/* ── Top navbar ─────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="h-full px-5 flex items-center justify-between max-w-screen-xl mx-auto">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-[var(--text-primary)] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="var(--bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-syne font-bold text-[15px] tracking-tight">StudyPal</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={toggle}
              className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors">
              <motion.div key={theme} initial={{ rotate: -20, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
                {theme === 'dark' ? <SunIcon size={17} /> : <MoonIcon size={17} />}
              </motion.div>
            </button>
            <button onClick={() => navigate('/workspaces')} className="btn-primary text-sm">
              Launch App <ArrowRightIcon size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────── */}
      <div className="flex flex-1 pt-14 max-w-screen-xl mx-auto w-full">

        {/* Docs sidebar */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 px-3"
          style={{ borderRight: '1px solid var(--border-color)' }}>
          <p className="label-section px-2 mb-3">Contents</p>
          <nav className="space-y-0.5">
            {sections.map(s => {
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm relative transition-colors duration-150 ${
                    isActive
                      ? 'text-[var(--text-primary)] font-medium'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="docs-active"
                      className="absolute inset-0 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-color)]"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                    />
                  )}
                  <s.icon size={15} className="relative z-10 shrink-0" />
                  <span className="relative z-10">{s.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 md:px-12 py-10 max-w-3xl">
          {/* Mobile section picker */}
          <div className="md:hidden mb-6 flex gap-2 overflow-x-auto pb-1">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  active === s.id
                    ? 'bg-[var(--text-primary)] text-[var(--bg)]'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <current.icon size={18} className="text-[var(--text-muted)]" />
              <p className="label-section">{current.label}</p>
            </div>
            <h1 className="font-syne text-3xl font-bold text-[var(--text-primary)] mb-6">
              {current.content.title}
            </h1>
            <div className="space-y-4">
              {current.content.body.map((para, i) => (
                <p key={i} className="text-[var(--text-muted)] leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {/* Next section link */}
            {(() => {
              const idx  = sections.findIndex(s => s.id === active);
              const next = sections[idx + 1];
              if (!next) return null;
              return (
                <button
                  onClick={() => setActive(next.id)}
                  className="mt-10 flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group"
                >
                  Next: {next.label}
                  <ChevronRightIcon size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              );
            })()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
