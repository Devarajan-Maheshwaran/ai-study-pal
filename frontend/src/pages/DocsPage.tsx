import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import {
  SunIcon, MoonIcon, ChevronRightIcon, ArrowRightIcon,
  BookIcon, BrainIcon, FlashIcon, ChartIcon,
  CalendarIcon, ChatIcon, FolderIcon, UploadIcon, DocsIcon, SettingsIcon,
} from '@/components/icons';

// ── Mini doc components ─────────────────────────────────────────────────────

function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  return (
    <div className="relative rounded-xl my-4" style={{ background: 'var(--bg)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center px-4 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-faint)]">{lang}</span>
      </div>
      <pre className="px-4 py-4 text-xs font-mono text-[var(--text-muted)] overflow-x-auto leading-relaxed whitespace-pre">{code}</pre>
    </div>
  );
}

function Callout({ type = 'info', children }: { type?: 'info' | 'warn' | 'success'; children: React.ReactNode }) {
  const styles = {
    info:    'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)]',
    warn:    'border-amber-500/40 bg-amber-500/5 text-amber-200',
    success: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-200',
  };
  const label = { info: 'Note', warn: 'Warning', success: 'Tip' };
  return (
    <div className={`rounded-xl border px-4 py-3 my-4 text-xs leading-relaxed ${styles[type]}`}>
      <span className="font-semibold uppercase tracking-wider mr-2 text-[10px]">{label[type]}</span>
      {children}
    </div>
  );
}

function DocTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4 rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[var(--text-faint)]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-[var(--text-muted)] font-mono">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Sections data ───────────────────────────────────────────────────────────

type DocSection = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  content: React.ReactNode;
};

const sections: DocSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: DocsIcon,
    content: (
      <>
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">
          StudyPal is an open-source AI study companion that helps you learn from your own material — not from
          pre-built content or external databases. Everything stays in your workspace.
        </p>
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">
          The system is built around five core tools: Quiz Arena, Smart Flashcards, AI Copilot, Analytics, and
          the Study Planner. Each one works exclusively from the documents you upload.
        </p>
        <DocTable
          headers={['Layer', 'Technology', 'Purpose']}
          rows={[
            ['Frontend', 'React 18 + TypeScript + Vite', 'SPA with full client-side routing'],
            ['Styling', 'Tailwind CSS + CSS variables', 'Themeable dark/light design system'],
            ['Backend', 'Python Flask + Gunicorn', 'REST API, document processing, AI'],
            ['Database', 'Supabase (Postgres)', 'Workspaces, quizzes, flashcards'],
            ['Vector store', 'ChromaDB (in-process)', 'Semantic search over documents'],
            ['Hosting', 'Vercel (FE) + Railway (BE)', 'Zero-config CI/CD from GitHub'],
          ]}
        />
        <Callout type="success">
          StudyPal runs entirely on your own backend — no data leaves your Railway container.
        </Callout>
      </>
    ),
  },
  {
    id: 'architecture',
    label: 'Architecture',
    icon: BrainIcon,
    content: (
      <>
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">
          The data flow starts when a user uploads a document. The Flask backend extracts raw text,
          chunks it into overlapping segments, and stores each chunk in both Postgres (for metadata)
          and ChromaDB (for vector embeddings).
        </p>
        <CodeBlock lang="text" code={`User uploads PDF / text / YouTube URL
         │
         ▼
  Flask /api/content  →  extraction pipeline
         │                  PyMuPDF  │  yt-transcript-api  │  plain text
         ▼
  chunk + embed  →  ChromaDB collection per workspace
         │
         ├──▶  Quiz:       retrieve top-k chunks → generate MCQs
         ├──▶  Flashcards: retrieve top-k chunks → generate Q/A pairs
         ├──▶  Copilot:    semantic search → grounded answer
         └──▶  Analytics:  aggregate quiz attempts → score trends`} />
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">
          Each workspace maps to its own ChromaDB collection. Deleting a workspace removes its
          Postgres rows (cascade) and its vector collection in one atomic operation.
        </p>
        <Callout type="info">
          ChromaDB runs in-process inside the Railway container and persists to disk. Mount a volume
          at <code className="font-mono">./data/chroma</code> in Railway to survive redeployments.
        </Callout>
      </>
    ),
  },
  {
    id: 'workspaces',
    label: 'Workspaces',
    icon: FolderIcon,
    content: (
      <>
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">
          A workspace is a self-contained study environment. Everything inside — materials, quizzes,
          flashcards, analytics — belongs to that workspace and does not bleed into others.
        </p>
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">
          Create one workspace per subject, course, or exam. Each workspace shows a summary card on
          the Workspaces page with recent activity and quiz stats.
        </p>
        <DocTable
          headers={['Field', 'Type', 'Notes']}
          rows={[
            ['id', 'UUID', 'Auto-generated'],
            ['name', 'string', 'Display name, max 200 chars'],
            ['subject', 'string', 'Optional subject tag'],
            ['exam_date', 'string | null', 'ISO date — used by Planner'],
            ['user_id', 'string', 'Defaults to \'dev\' until auth is wired'],
          ]}
        />
        <Callout type="warn">
          Deleting a workspace is permanent and removes all associated vectors from ChromaDB.
        </Callout>
      </>
    ),
  },
  {
    id: 'materials',
    label: 'Study Materials',
    icon: UploadIcon,
    content: (
      <>
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">
          Three input types are supported: plain text paste, PDF upload, and YouTube video URL.
          Each goes through an extraction pipeline before being stored.
        </p>
        <DocTable
          headers={['Source type', 'Library', 'Output']}
          rows={[
            ['PDF', 'PyMuPDF (fitz)', 'Full text extracted page-by-page'],
            ['YouTube URL', 'youtube-transcript-api', 'Auto-generated transcript'],
            ['Plain text', 'Direct', 'Chunked immediately'],
          ]}
        />
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">
          After extraction, content is split into overlapping 500-token chunks and embedded into
          ChromaDB for semantic search. The raw text and metadata are also saved to Postgres.
        </p>
        <Callout type="info">
          Max upload size is 20 MB, configured in <code className="font-mono">backend/config.py</code>.
        </Callout>
      </>
    ),
  },
  {
    id: 'api',
    label: 'API Reference',
    icon: ChatIcon,
    content: (
      <>
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">
          All endpoints are prefixed with <code className="font-mono">/api</code> and return JSON.
          The backend does not require authentication tokens in development — the <code className="font-mono">user_id</code> defaults to <code className="font-mono">&quot;dev&quot;</code>.
        </p>
        <DocTable
          headers={['Method', 'Path', 'Description']}
          rows={[
            ['GET',  '/health',                          'Health check — returns status + timestamp'],
            ['GET',  '/api/workspaces',                  'List all workspaces'],
            ['POST', '/api/workspaces',                  'Create workspace { name, subject, exam_date }'],
            ['GET',  '/api/workspaces/:id',              'Get workspace by ID'],
            ['DELETE','/api/workspaces/:id',             'Delete workspace + all data'],
            ['POST', '/api/content/:workspace_id',       'Upload document { type, content/file }'],
            ['GET',  '/api/content/:workspace_id',       'List documents in workspace'],
            ['DELETE','/api/content/:workspace_id/:doc_id','Delete document + its vectors'],
            ['POST', '/api/quiz/:workspace_id/generate', 'Generate MCQ quiz from workspace content'],
            ['POST', '/api/quiz/:workspace_id/submit',   'Submit answers, get score + feedback'],
            ['GET',  '/api/flashcards/:workspace_id',    'List flashcards'],
            ['POST', '/api/flashcards/:workspace_id/generate', 'Generate flashcards from content'],
            ['POST', '/api/flashcards/:workspace_id/:id/review', 'SM-2 review { rating: easy|good|hard }'],
            ['POST', '/api/copilot/:workspace_id',       'Ask question { question, history? }'],
          ]}
        />
        <Callout type="info">
          The frontend reads the backend base URL from <code className="font-mono">VITE_API_BASE_URL</code>.
          Set this in your Vercel environment variables to point at your Railway deployment.
        </Callout>
      </>
    ),
  },
  {
    id: 'models',
    label: 'Data Models',
    icon: FlashIcon,
    content: (
      <>
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">
          All models live in <code className="font-mono">backend/db/models.py</code> and are managed
          by SQLAlchemy. Tables are created automatically on first boot via
          <code className="font-mono"> Base.metadata.create_all()</code> inside the app factory.
        </p>
        <DocTable
          headers={['Table', 'Key columns', 'Relations']}
          rows={[
            ['workspaces',      'id, user_id, name, subject, exam_date',             '→ topics, documents'],
            ['topics',          'id, workspace_id, name, mastery_score',             '← workspace'],
            ['documents',       'id, workspace_id, title, source_type, word_count', '→ chunks, ← workspace'],
            ['document_chunks', 'id, document_id, chunk_index, text',               '← document'],
            ['quizzes',         'id, workspace_id, questions (JSON)',                '→ attempts'],
            ['quiz_attempts',   'id, quiz_id, score, correct, total, ml_feedback',  '← quiz'],
            ['flashcards',      'id, workspace_id, front, back, interval, ef',      '← workspace (via route model)'],
          ]}
        />
        <Callout type="success">
          Foreign keys use <code className="font-mono">ON DELETE CASCADE</code> — deleting a workspace
          cleans up all child rows automatically.
        </Callout>
      </>
    ),
  },
  {
    id: 'local-dev',
    label: 'Local Dev',
    icon: BookIcon,
    content: (
      <>
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">
          You need Node ≥ 18 and Python ≥ 3.11. Clone the repo, then follow these steps.
        </p>
        <CodeBlock lang="bash" code={`# 1. Clone
git clone https://github.com/Devarajan-Maheshwaran/ai-study-pal.git
cd ai-study-pal

# 2. Backend — create venv and install deps
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt

# 3. Copy env file and fill in your values
cp .env.example .env
# Edit .env with your Supabase URL + service key

# 4. Run the Flask dev server (from repo root)
cd ..
python -m backend.app

# 5. Frontend (separate terminal)
cd frontend
npm install
npm run dev`} />
        <Callout type="info">
          The Vite dev server proxies <code className="font-mono">/api</code> to
          <code className="font-mono"> http://localhost:5000</code>. Make sure the backend is running
          before starting the frontend.
        </Callout>
        <p className="text-[var(--text-muted)] leading-relaxed mt-4">
          Open <code className="font-mono">http://localhost:5173</code> to see the app.
          Hot-module reload is enabled on the frontend; Flask will auto-reload on file save.
        </p>
      </>
    ),
  },
  {
    id: 'env',
    label: 'Environment Vars',
    icon: SettingsIcon,
    content: (
      <>
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">
          Copy <code className="font-mono">backend/.env.example</code> to
          <code className="font-mono"> backend/.env</code> for local development.
          For Railway, set these as service environment variables.
        </p>
        <DocTable
          headers={['Variable', 'Required', 'Description']}
          rows={[
            ['SUPABASE_URL',        'Yes', 'Your Supabase project URL'],
            ['SUPABASE_SERVICE_KEY','Yes', 'Service role key (not anon key)'],
            ['DATABASE_URL',        'Yes', 'Postgres connection string from Supabase'],
            ['FLASK_SECRET_KEY',    'Yes', 'Random secret for Flask sessions'],
            ['CORS_ORIGINS',        'Yes', 'Comma-separated list of allowed origins'],
            ['FLASK_ENV',           'No',  'development | production'],
            ['CHROMADB_PATH',       'No',  'Local path for ChromaDB data (default: ./data/chroma)'],
            ['UPLOAD_FOLDER',       'No',  'Local upload dir (default: ./data/uploads)'],
          ]}
        />
        <p className="text-[var(--text-muted)] leading-relaxed mt-4 mb-2">
          Frontend environment variables (set in Vercel dashboard or <code className="font-mono">frontend/.env.local</code>):
        </p>
        <DocTable
          headers={['Variable', 'Required', 'Description']}
          rows={[
            ['VITE_SUPABASE_URL',          'Yes', 'Same as backend SUPABASE_URL'],
            ['VITE_SUPABASE_PUBLISHABLE_KEY','Yes', 'Supabase anon/public key'],
            ['VITE_API_BASE_URL',          'Yes', 'Your Railway backend URL (e.g. https://your-app.railway.app)'],
          ]}
        />
        <Callout type="warn">
          Never commit real values to <code className="font-mono">.env</code> files.
          The <code className="font-mono">backend/.env</code> file is git-ignored. Use
          <code className="font-mono"> .env.example</code> as a reference only.
        </Callout>
      </>
    ),
  },
  {
    id: 'deployment',
    label: 'Deployment',
    icon: CalendarIcon,
    content: (
      <>
        <p className="text-[var(--text-muted)] leading-relaxed mb-6">
          StudyPal deploys across three services: Vercel for the frontend, Railway for the backend,
          and Supabase for the database. All three have free tiers that cover normal usage.
        </p>

        <h3 className="font-syne font-semibold text-[var(--text-primary)] mb-2">1. Supabase</h3>
        <ol className="text-sm text-[var(--text-muted)] space-y-1 mb-4 list-decimal pl-5">
          <li>Create a new project at <code className="font-mono">supabase.com</code>.</li>
          <li>Go to <strong>Settings → Database</strong> and copy the connection string.</li>
          <li>The app auto-creates all tables on first boot — no manual SQL needed.</li>
          <li>Copy <strong>Project URL</strong> and <strong>service_role</strong> key for env vars.</li>
        </ol>

        <h3 className="font-syne font-semibold text-[var(--text-primary)] mb-2">2. Railway (backend)</h3>
        <ol className="text-sm text-[var(--text-muted)] space-y-1 mb-4 list-decimal pl-5">
          <li>Connect your GitHub repo in the Railway dashboard.</li>
          <li>Set the root directory to <code className="font-mono">/</code> (repo root).</li>
          <li>Railway uses the <code className="font-mono">Procfile</code> automatically:
            <CodeBlock lang="text" code="web: gunicorn 'backend.app:create_app()' --bind 0.0.0.0:$PORT --workers 2 --timeout 120" />
          </li>
          <li>Add all required env vars from the table above.</li>
          <li>Add a volume mounted at <code className="font-mono">/app/data</code> for ChromaDB persistence.</li>
        </ol>

        <h3 className="font-syne font-semibold text-[var(--text-primary)] mb-2">3. Vercel (frontend)</h3>
        <ol className="text-sm text-[var(--text-muted)] space-y-1 mb-4 list-decimal pl-5">
          <li>Import the same GitHub repo in the Vercel dashboard.</li>
          <li>Vercel reads <code className="font-mono">vercel.json</code> from the repo root:
            <CodeBlock lang="json" code={`{
  "installCommand": "cd frontend && npm install",
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [{ "source": "/((?!api).*)", "destination": "/index.html" }]
}`} />
          </li>
          <li>Add <code className="font-mono">VITE_SUPABASE_URL</code>, <code className="font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code>,
            and <code className="font-mono">VITE_API_BASE_URL</code> as environment variables.</li>
          <li>Deploy. Every push to <code className="font-mono">main</code> triggers an automatic redeploy.</li>
        </ol>

        <Callout type="success">
          After Railway gives you a public URL, update <code className="font-mono">CORS_ORIGINS</code> on Railway
          to include your Vercel deployment URL and redeploy.
        </Callout>
      </>
    ),
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
            <button onClick={() => navigate('/auth')} className="btn-primary text-sm">
              Get started <ArrowRightIcon size={15} />
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
              {current.label}
            </h1>

            <div className="prose-doc">
              {current.content}
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
