import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRightIcon, SunIcon, MoonIcon, CheckIcon } from '@/components/icons';

type Mode = 'login' | 'register';

const perks = [
  'Progress saved across devices',
  'Unlimited workspaces',
  'AI copilot with full context',
];

export default function AuthPage() {
  const navigate          = useNavigate();
  const { theme, toggle } = useTheme();
  const [mode, setMode]   = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Account created — check your email to confirm.');
      }
      navigate('/workspaces');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col">

      {/* ── Navbar ─────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="h-full px-5 flex items-center justify-between max-w-6xl mx-auto">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--text-primary)] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="var(--bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-syne font-bold text-[15px] tracking-tight">StudyPal</span>
          </button>
          <button onClick={toggle}
            className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors">
            <motion.div key={theme} initial={{ rotate: -20, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
              {theme === 'dark' ? <SunIcon size={17} /> : <MoonIcon size={17} />}
            </motion.div>
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center pt-14 px-5 py-12">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center">

          {/* Left — perks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:block"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
              style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
              Free · Open source · No card required
            </div>
            <h1 className="font-syne text-4xl font-extrabold text-[var(--text-primary)] leading-tight mb-4">
              Your AI study
              <br />companion awaits
            </h1>
            <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
              Upload your material once. Get quizzes, flashcards, an AI tutor,
              and a full analytics dashboard — all grounded in your own notes.
            </p>
            <ul className="space-y-3">
              {perks.map((perk, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                  <div className="w-5 h-5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
                    <CheckIcon size={11} className="text-[var(--text-primary)]" />
                  </div>
                  {perk}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-2xl p-7"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>

              {/* Mode toggle */}
              <div className="flex rounded-xl overflow-hidden mb-6"
                style={{ background: 'var(--bg-subtle)' }}>
                {(['login', 'register'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                      mode === m
                        ? 'bg-[var(--text-primary)] text-[var(--bg)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {m === 'login' ? 'Log in' : 'Sign up'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="font-syne text-xl font-bold text-[var(--text-primary)] mb-1">
                    {mode === 'login' ? 'Welcome back' : 'Create your account'}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mb-6">
                    {mode === 'login'
                      ? 'Sign in to continue to your workspaces.'
                      : 'Free forever. No credit card needed.'}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">Email</label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--bg)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">Password</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--bg)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full py-3 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? 'Please wait…'
                        : mode === 'login' ? 'Continue' : 'Create account'}
                      {!loading && <ArrowRightIcon size={15} />}
                    </button>
                  </form>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[var(--border-color)]" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-[var(--bg-card)] text-[var(--text-faint)]">or</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/workspaces')}
                    className="btn-ghost w-full py-2.5 text-sm"
                  >
                    Continue without an account
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
