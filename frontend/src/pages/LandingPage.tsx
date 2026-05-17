import { Link } from 'react-router-dom';
import {
  Brain, Target, Zap, TrendingUp, BarChart3,
  BookOpen, FileText, Upload, Youtube,
  ArrowRight, Github, Layers
} from 'lucide-react';
import PageShell from '@/components/forge/PageShell';

const MODELS = [
  {
    num: '01',
    title: 'Quiz Difficulty Classifier',
    desc: 'Classifies every generated question into easy / medium / hard using a trained NB model.',
    icon: Target,
  },
  {
    num: '02',
    title: 'Topic Clustering & Extraction',
    desc: 'Unsupervised clustering surfaces the core topics in any uploaded content.',
    icon: Layers,
  },
  {
    num: '03',
    title: 'Text Summarizer',
    desc: 'TF-IDF extraction condenses notes into concise revision bullets.',
    icon: FileText,
  },
  {
    num: '04',
    title: 'Feedback Generator',
    desc: 'Generates per-question feedback based on your answer pattern.',
    icon: Brain,
  },
  {
    num: '05',
    title: 'Knowledge Tracing',
    desc: 'BKT-inspired model tracks your learning curve across sessions.',
    icon: TrendingUp,
  },
  {
    num: '06',
    title: 'Exam Score Predictor',
    desc: 'Regression model predicts readiness from quiz history and consistency.',
    icon: BarChart3,
  },
  {
    num: '07',
    title: 'Study Time Optimizer',
    desc: 'Weighs your weak topics higher when allocating daily study time.',
    icon: Zap,
  },
  {
    num: '08',
    title: 'Concept Difficulty Ranker',
    desc: 'Ranks concepts by inherent difficulty to guide revision priority.',
    icon: Target,
  },
  {
    num: '09',
    title: 'Resource Recommender',
    desc: 'Suggests revision materials aligned to your weakest concept clusters.',
    icon: BookOpen,
  },
  {
    num: '10',
    title: 'Evaluation Dashboard',
    desc: 'Aggregates all model signals into a single readiness scorecard.',
    icon: BarChart3,
  },
];

const INPUTS = [
  { icon: FileText, label: 'Paste notes', sub: 'Any plain text' },
  { icon: Upload,   label: 'Upload PDF',  sub: 'Documents, slides' },
  { icon: Youtube,  label: 'YouTube URL', sub: 'Auto-transcribed' },
];

export default function LandingPage() {
  return (
    <PageShell>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="page-wrap pt-16 pb-20">
        <div className="max-w-2xl">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="tag">v0.1 alpha</span>
            <span className="tag">10 trained ML models</span>
            <span className="tag">no external AI APIs</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-ink leading-[1.12] tracking-tight mb-6 animate-fade-up">
            Your notes,&nbsp;
            <span className="relative inline-block">
              <span className="relative z-10">turned into</span>
              <span
                className="absolute -bottom-1 left-0 w-full h-[6px] bg-ink/10 rounded"
                aria-hidden
              />
            </span>
            {' '}a study OS.
          </h1>

          <p className="text-sm sm:text-base text-ink-faint leading-relaxed max-w-xl mb-8 animate-fade-up animate-delay-100">
            StudyForge transforms any PDF, note, or lecture into adaptive quizzes,
            flashcards, revision plans, and a Jarvis-like copilot — all powered
            entirely by your own ML models trained in Jupyter.
          </p>

          <div className="flex flex-wrap gap-3 animate-fade-up animate-delay-200">
            <Link to="/workspaces" className="btn-ink">
              Open study OS
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/Devarajan-Maheshwaran/ai-study-pal"
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Rule ────────────────────────────────────────────── */}
      <div className="rule-x" />

      {/* ── Input types ─────────────────────────────────────── */}
      <section className="page-wrap py-14">
        <p className="section-label mb-5">Works with any content</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {INPUTS.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="card-paper p-5 flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-forge-rule bg-paper text-ink-soft">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">{label}</p>
                <p className="text-xs text-ink-faint">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="rule-x" />

      {/* ── ML Models grid ──────────────────────────────────── */}
      <section className="page-wrap py-14">
        <p className="section-label mb-2">Intelligence layer</p>
        <h2 className="text-2xl font-bold text-ink mb-2">10 trained ML models, zero cloud AI</h2>
        <p className="text-sm text-ink-faint mb-8 max-w-xl">
          Every insight — quiz difficulty, knowledge tracing, exam prediction, study planning —
          runs on models trained in your own Jupyter notebooks.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODELS.map(({ num, title, desc, icon: Icon }) => (
            <div key={num} className="card-paper p-5 group">
              <div className="flex items-start justify-between mb-3">
                <span className="font-mono text-[10px] text-ink-ghost">{num}</span>
                <Icon className="h-4 w-4 text-ink-ghost group-hover:text-ink-soft transition-colors" />
              </div>
              <p className="text-sm font-semibold text-ink mb-1">{title}</p>
              <p className="text-xs text-ink-faint leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rule-x" />

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="page-wrap py-16">
        <div className="card-paper p-8 sm:p-12 text-center">
          <p className="section-label mb-3">Ready to use</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-3">
            Create your first study workspace.
          </h2>
          <p className="text-sm text-ink-faint max-w-md mx-auto mb-7">
            Upload notes, generate questions, track weaknesses, and plan revision —
            all in one place. No sign-up required in alpha.
          </p>
          <Link to="/workspaces" className="btn-ink">
            Open study OS
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="rule-x">
        <div className="page-wrap flex flex-wrap items-center justify-between gap-2 py-4 text-[11px] font-mono text-ink-ghost">
          <span>StudyForge — AI study OS</span>
          <span>React + Flask + 10 trained ML models · no external AI APIs</span>
        </div>
      </footer>
    </PageShell>
  );
}
