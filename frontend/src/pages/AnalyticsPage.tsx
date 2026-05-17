import { useParams } from 'react-router-dom';
import { BarChart3, TrendingUp, Target, Brain, Loader2 } from 'lucide-react';
import PaperCard from '@/components/forge/PaperCard';
import ProgressRing from '@/components/forge/ProgressRing';
import EmptyState from '@/components/forge/EmptyState';
import { useProgress, useExamPrediction, useWeakTopics, useQuizHistory } from '@/hooks/useWorkspace';

export default function AnalyticsPage() {
  const { id = '' } = useParams();
  const { data: progress, isLoading: loadingP } = useProgress(id);
  const { data: exam }     = useExamPrediction(id);
  const { data: weak }     = useWeakTopics(id);
  const { data: history }  = useQuizHistory(id);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: 'predicted score', value: exam?.predicted_score != null ? `${exam.predicted_score}%` : '—', icon: Target },
          { label: 'avg accuracy',    value: progress ? `${progress.average_accuracy}%` : '—',               icon: Brain },
          { label: 'sessions / week', value: progress ? String(progress.sessions_this_week) : '—',            icon: TrendingUp },
          { label: 'total quizzes',   value: progress ? String(progress.total_attempts) : '—',               icon: BarChart3 },
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
        {!weak || weak.length === 0 ? (
          <p className="text-xs text-ink-faint">No topic data yet — take a quiz to build the mastery map.</p>
        ) : (
          <div className="flex flex-wrap gap-6">
            {weak.map(t => (
              <ProgressRing key={t.name} value={Math.round(t.mastery)} label={t.name.slice(0, 12)} />
            ))}
          </div>
        )}
      </PaperCard>

      {/* Score trend */}
      <PaperCard>
        <p className="section-label mb-3">score trend</p>
        {loadingP ? (
          <div className="flex items-center gap-2 text-xs text-ink-faint"><Loader2 className="h-3.5 w-3.5 animate-spin" />Loading…</div>
        ) : !progress || progress.score_trend.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="h-7 w-7" />}
            title="No data yet"
            description="Complete at least one quiz to see your score trend."
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1 h-24 min-w-0">
              {progress.score_trend.map(point => (
                <div key={point.attempt} className="flex flex-col items-center gap-1 flex-1 min-w-[20px]">
                  <div
                    className="w-full rounded-sm bg-ink/80 transition-all duration-500"
                    style={{ height: `${Math.max(4, point.score)}%` }}
                    title={`Quiz ${point.attempt}: ${point.score}%`}
                  />
                  <span className="text-[9px] font-mono text-ink-ghost">{point.attempt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </PaperCard>

      {/* Quiz history */}
      <PaperCard>
        <p className="section-label mb-3">recent quiz attempts</p>
        {!history || history.length === 0 ? (
          <p className="text-xs text-ink-faint">No attempts yet.</p>
        ) : (
          <div className="divide-y divide-forge-rule">
            {history.slice(0, 10).map(a => (
              <div key={a.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-ink">{a.score}%</span>
                  <span className="text-[11px] font-mono text-ink-ghost ml-2">{a.correct}/{a.total} correct</span>
                </div>
                <span className="text-[11px] font-mono text-ink-ghost">
                  {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </PaperCard>
    </div>
  );
}
