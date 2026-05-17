import { NavLink, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Overview',      path: '' },
  { label: 'Study material', path: 'material' },
  { label: 'Quiz arena',    path: 'quiz' },
  { label: 'Flashcards',    path: 'flashcards' },
  { label: 'Copilot',       path: 'copilot' },
  { label: 'Analytics',     path: 'analytics' },
  { label: 'Planner',       path: 'planner' },
];

export default function WorkspaceTab() {
  const { id } = useParams();
  const base = `/workspaces/${id}`;

  return (
    <nav className="rule-x bg-paper overflow-x-auto">
      <div className="page-wrap flex items-end gap-0">
        {TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path === '' ? base : `${base}/${tab.path}`}
            end={tab.path === ''}
            className={({ isActive }) =>
              cn(
                'px-3 sm:px-4 py-2.5 text-xs font-mono whitespace-nowrap',
                'border-b-2 -mb-[1px] transition-colors duration-100',
                isActive
                  ? 'border-ink text-ink font-medium'
                  : 'border-transparent text-ink-faint hover:text-ink-soft hover:border-ink-ghost',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
