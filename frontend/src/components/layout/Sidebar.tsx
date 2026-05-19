import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import {
  HomeIcon, BookIcon, FlashIcon, ChatIcon,
  ChartIcon, CalendarIcon, FolderIcon,
  SunIcon, MoonIcon, MenuIcon, CloseIcon, LogOutIcon, DocsIcon,
} from '@/components/icons';

const APP_NAV = [
  { label: 'Dashboard',     icon: HomeIcon,     path: '' },
  { label: 'Materials',     icon: BookIcon,     path: 'material' },
  { label: 'Quiz Arena',    icon: FlashIcon,    path: 'quiz' },
  { label: 'Flashcards',    icon: FolderIcon,   path: 'flashcards' },
  { label: 'AI Copilot',    icon: ChatIcon,     path: 'copilot' },
  { label: 'Analytics',     icon: ChartIcon,    path: 'analytics' },
  { label: 'Planner',       icon: CalendarIcon, path: 'planner' },
];

const TOP_NAV = [
  { label: 'Workspaces', icon: FolderIcon, path: '/workspaces' },
  { label: 'Docs',       icon: DocsIcon,   path: '/docs' },
];

export function Sidebar() {
  const navigate      = useNavigate();
  const location      = useLocation();
  const { id }        = useParams<{ id: string }>();
  const { theme, toggle } = useTheme();
  const [open, setOpen]   = useState(false);

  const inWorkspace = !!id;
  const navItems    = inWorkspace ? APP_NAV : TOP_NAV;

  const resolve = (path: string) =>
    inWorkspace
      ? path === '' ? `/workspaces/${id}` : `/workspaces/${id}/${path}`
      : path;

  const isActive = (path: string) => location.pathname === resolve(path);

  const goto = (path: string) => {
    navigate(resolve(path));
    setOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <button
          onClick={() => { navigate('/'); setOpen(false); }}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-7 h-7 rounded-lg bg-[var(--text-primary)] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--bg)">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--bg)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-syne font-bold text-[15px] text-[var(--text-primary)] tracking-tight">
            StudyPal
          </span>
        </button>
        <button
          onClick={() => setOpen(false)}
          className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <CloseIcon size={18} />
        </button>
      </div>

      {/* Workspace label */}
      {inWorkspace && (
        <div className="px-5 mb-2">
          <button
            onClick={() => navigate('/workspaces')}
            className="label-section hover:text-[var(--text-muted)] transition-colors cursor-pointer flex items-center gap-1"
          >
            Workspace
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.label}
              onClick={() => goto(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium relative transition-colors duration-150 ${
                active
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-color)]"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                />
              )}
              <item.icon size={17} className="relative z-10 shrink-0" />
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="px-3 pb-5 pt-3 border-t border-[var(--border-color)] space-y-0.5">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]
            transition-colors duration-150"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {theme === 'dark' ? <SunIcon size={17} /> : <MoonIcon size={17} />}
          </motion.div>
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>

        {/* Leave workspace */}
        {inWorkspace && (
          <button
            onClick={() => navigate('/workspaces')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]
              transition-colors duration-150"
          >
            <LogOutIcon size={17} />
            <span>All Workspaces</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-full z-40"
        style={{ width: 'var(--sidebar-w)', borderRight: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile topbar ────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4"
        style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}
      >
        <button
          onClick={() => { navigate('/'); }}
          className="flex items-center gap-2 group"
        >
          <div className="w-6 h-6 rounded-md bg-[var(--text-primary)] flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-syne font-bold text-[14px] text-[var(--text-primary)]">StudyPal</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors">
            {theme === 'dark' ? <SunIcon size={17} /> : <MoonIcon size={17} />}
          </button>
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors">
            <MenuIcon size={18} />
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="md:hidden fixed top-0 left-0 h-full z-50"
              style={{ width: 'var(--sidebar-w)', background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)' }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 38 }}
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
