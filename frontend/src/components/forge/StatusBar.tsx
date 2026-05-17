// Workspace header status strip — shows exam countdown, mastery, session stats
// Data is placeholder in Phase 1; wired to backend in Phase 2+
import { Calendar, Zap, Target } from 'lucide-react';

interface StatusBarProps {
  workspaceName: string;
  subject?: string;
  examDate?: string;
  masteryPct?: number;
  sessionCount?: number;
}

export default function StatusBar({
  workspaceName,
  subject = '—',
  examDate = '—',
  masteryPct,
  sessionCount,
}: StatusBarProps) {
  return (
    <div className="rule-x bg-paper-subtle">
      <div className="page-wrap flex flex-wrap items-center justify-between gap-2 py-2">
        <div>
          <p className="section-label">{subject}</p>
          <h1 className="text-base font-semibold text-ink leading-snug">{workspaceName}</h1>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-ink-faint">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {examDate}
          </span>
          {masteryPct !== undefined && (
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {masteryPct}% mastery
            </span>
          )}
          {sessionCount !== undefined && (
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {sessionCount} sessions
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
