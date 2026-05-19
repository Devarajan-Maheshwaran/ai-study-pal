import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { BlurText }     from '@/components/reactbits/BlurText';
import { ShinyText }    from '@/components/reactbits/ShinyText';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { LogoLoop }     from '@/components/reactbits/LogoLoop';
import {
  ArrowRightIcon, SunIcon, MoonIcon, SparkleIcon,
  BrainIcon, FlashIcon, ChartIcon, BookIcon,
  CalendarIcon, ChatIcon, CheckIcon, DocsIcon, GithubIcon,
} from '@/components/icons';

const features = [
  { icon: BrainIcon,    title: 'AI Copilot',        desc: 'Ask anything about your study material. Context-aware answers drawn directly from your uploaded content.' },
  { icon: FlashIcon,    title: 'Quiz Arena',         desc: 'Auto-generate multiple-choice quizzes from any material. Track scores and see weak areas highlighted instantly.' },
  { icon: BookIcon,     title: 'Smart Flashcards',   desc: 'Spaced-repetition review queue powered by the SM-2 algorithm. Study smarter, not longer.' },
  { icon: ChartIcon,    title: 'Analytics',          desc: 'Score trends, performance per topic, and an exam-readiness prediction built from your real quiz history.' },
  { icon: CalendarIcon, title: 'Study Planner',      desc: 'Structured daily schedule generated from your target exam date and current performance.' },
  { icon: ChatIcon,     title: 'Multi-Workspace',    desc: 'Separate everything by subject or course. Each workspace has its own material, quizzes, and progress.' },
];

const steps = [
  { n: '01', label: 'Create a Workspace', desc: 'Group your study material by subject, course, or exam. Each workspace is fully isolated.' },
  { n: '02', label: 'Upload Study Material', desc: 'Paste text, upload a PDF, or drop a YouTube link. The system extracts and indexes the content automatically.' },
  { n: '03', label: 'Generate Quizzes or Flashcards', desc: 'One click generates a full quiz or flashcard deck from your material. Difficulty is calibrated to your history.' },
  { n: '04', label: 'Review with AI Copilot', desc: 'Ask questions in plain English. The copilot answers using only your uploaded content — no hallucinations from outside.' },
  { n: '05', label: 'Track Your Progress', desc: 'Analytics shows exactly where you are strong and where to focus. The planner builds your remaining schedule.' },
];

const techStack = [
  'React', 'TypeScript', 'Vite', 'Flask', 'Python',
  'Supabase', 'ChromaDB', 'Railway', 'Vercel', 'Tailwind CSS',
];

const stats = [
  { value: '5x', label: 'Faster revision' },
  { value: '100%', label: 'Context-grounded AI' },
  { value: '0', label: 'External data sent' },
];

export default function LandingPage() {
  const navigate        = useNavigate();
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">

      {/* ── Navbar ─────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-6xl mx-auto h-full px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--text-primary)] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="var(--bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-syne font-bold text-[15px] tracking-tight">StudyPal</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/docs')}
              className="btn-ghost text-sm px-4 py-2">
              <DocsIcon size={15} /> Docs
            </button>
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

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="pt-36 pb-24 px-5 text-center max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
            <SparkleIcon size={12} />
            AI-powered study companion — fully open source
          </div>

          <h1 className="font-syne text-5xl md:text-7xl font-extrabold leading-[1.05] mb-5">
            <BlurText text="Study smarter." className="justify-center text-[var(--text-primary)]" />
            <ShinyText text="Learn faster." className="font-syne text-5xl md:text-7xl font-extrabold mt-1" />
          </h1>

          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your study material, auto-generate quizzes and flashcards,
            ask an AI that only uses your content, and track your progress — all in one focused workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate('/workspaces')} className="btn-primary px-8 py-3 text-base">
              Start for free <ArrowRightIcon size={16} />
            </button>
            <a href="https://github.com/Devarajan-Maheshwaran/ai-study-pal"
              target="_blank" rel="noopener noreferrer"
              className="btn-ghost px-6 py-3 text-base">
              <GithubIcon size={16} /> View on GitHub
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Stats ──────────────────────────────────────── */}
      <section className="py-10 px-5 max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} viewport={{ once: true }}
              className="text-center py-6 rounded-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="font-syne text-3xl font-extrabold text-[var(--text-primary)] mb-1">{s.value}</div>
              <div className="text-xs text-[var(--text-muted)] font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Tech strip ─────────────────────────────────── */}
      <section className="py-8 px-5">
        <p className="label-section text-center mb-5">Built with</p>
        <LogoLoop items={techStack} speed={32} />
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="py-20 px-5 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="label-section mb-3">Features</p>
          <h2 className="font-syne text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Everything you need to ace any exam
          </h2>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto">
            Each tool is purpose-built for active recall, not passive reading.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.45 }} viewport={{ once: true }}>
              <SpotlightCard className="p-6 h-full">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                  <f.icon size={18} className="text-[var(--text-primary)]" />
                </div>
                <h3 className="font-syne font-semibold text-[var(--text-primary)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────── */}
      <section className="py-20 px-5 max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="label-section mb-3">How it works</p>
          <h2 className="font-syne text-3xl font-bold text-[var(--text-primary)]">From upload to exam-ready in minutes</h2>
        </div>
        <div className="space-y-4">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }} viewport={{ once: true }}
              className="flex gap-5 items-start p-5 rounded-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <span className="font-syne text-2xl font-black text-[var(--text-faint)] w-8 shrink-0 leading-none pt-0.5">{s.n}</span>
              <div>
                <p className="font-syne font-semibold text-[var(--text-primary)] mb-1">{s.label}</p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="py-24 px-5 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-syne text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Ready to study smarter?
          </h2>
          <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
            No account required. Create your first workspace and start in under 30 seconds.
          </p>
          <button onClick={() => navigate('/workspaces')} className="btn-primary px-10 py-3.5 text-base">
            Open StudyPal <ArrowRightIcon size={16} />
          </button>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="py-8 px-5 text-center"
        style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <div className="w-5 h-5 rounded-md bg-[var(--text-primary)] flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--bg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-syne font-bold text-sm text-[var(--text-primary)]">StudyPal</span>
        </div>
        <p className="text-xs text-[var(--text-faint)]">
          Open source — MIT licence
        </p>
      </footer>
    </div>
  );
}
