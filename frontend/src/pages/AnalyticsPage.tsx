import { BarChart3, TrendingUp, Target, Brain } from 'lucide-react';
import PaperCard from '@/components/forge/PaperCard';
import ProgressRing from '@/components/forge/ProgressRing';
import EmptyState from '@/components/forge/EmptyState';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: 'predicted score',   value: '—%', icon: Target },
          { label: 'knowledge level',   value: '—',  icon: Brain },
          { label: 'sessions logged',   value: '0',  icon: TrendingUp },
          { label: 'topics tracked',    value: '0',  icon: BarChart3 },
        ].map(({ label, value, icon: Icon }) => (
          <PaperCard key={label} className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-ink-faint shrink-0" />
            <div>
              <p className="section-label">{label}</p>
              <p className="text-xl font-bold font-mono text-ink">{value}</p>
            </div>
          </PaperCard>
        ))}
      </div>

      {/* Mastery by topic */}
      <PaperCard>
        <p className="section-label mb-4">mastery by topic</p>
        <div className="flex flex-wrap gap-6">
          {[0, 0, 0].map((v, i) => (
            <ProgressRing key={i} value={v} label={`Topic ${i + 1}`} />
          ))}
        </div>
        <p className="mt-4 text-[11px] font-mono text-ink-ghost">
          ✦ Populated after quiz attempts — Knowledge Tracing (NB05) + Exam Score Predictor (NB06)
        </p>
      </PaperCard>

      {/* Score trend */}
      <PaperCard>
        <p className="section-label mb-3">score trend</p>
        <EmptyState
          icon={<BarChart3 className="h-7 w-7" />}
          title="No data yet"
          description="Score trend chart is rendered from quiz_attempts table. Complete at least one quiz to see your learning curve."
        />
        <p className="mt-3 text-[11px] font-mono text-ink-ghost">
          ✦ Recharts / Plotly chart wired in Phase 2
        </p>
      </PaperCard>
    </div>
  );
}
