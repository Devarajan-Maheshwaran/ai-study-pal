import { Link, useParams } from 'react-router-dom';
import { BarChart3, Target, Zap, BookOpen, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import PaperCard from '@/components/forge/PaperCard';
import ProgressRing from '@/components/forge/ProgressRing';
import { useWorkspaceDetail, useProgress, useExamPrediction, useWeakTopics } from '@/hooks/useWorkspace';

export default function WorkspaceDashboardPage() {
  const { id = '' } = useParams();
  const { data: ws }       = useWorkspaceDetail(id);
  const { data: progress } = useProgress(id);
  const { data: exam }     = useExamPrediction(id);
  const { data: weak }     = useWeakTopics(id);

  const mastery = progress?.average_accuracy ?? 0;

  const quickLinks = [
    { label: 'Study material',  path: 'material',   icon: BookOpen },
    { label: 'Quiz arena',      path: 'quiz',        icon: Target },
    { label: 'Flashcards',      path: 'flashcards',  icon: Zap },
    { label: 'Analytics',       path: 'analytics',   icon: BarChart3 },
    { label: 'Planner',         path: 'planner',     icon: Calendar },
    { label: 'Copilot',         path: 'copilot',     icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <PaperCard className="flex items-center gap-4">
          <ProgressRing value={Math.round(mastery)} label="mastery" />
          <div>
            <p className="section-label">avg accuracy</p>
            <p className="text-sm font-semibold text-ink mt-0.5">
              {progress ? `${mastery}% over ${progress.total_attempts} quiz${progress.total_attempts === 1 ? '' : 'zes'}` : '—'}
            </p>
          </div>
        </PaperCard>

        <PaperCard>
          <p className="section-label mb-1">exam prediction</p>
          {exam?.predicted_score != null ? (
            <>
              <p className="text-2xl font-bold font-mono text-ink">{exam.predicted_score}%</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`tag ${
                  exam.readiness === 'High' ? 'bg-status-green/10 text-status-green border-status-green/20'
                  : exam.readiness === 'Medium' ? 'bg-status-amber/10 text-status-amber border-status-amber/20'
                  : 'bg-status-red/10 text-status-red border-status-red/20'
                }`}>{exam.readiness}</span>
                <span className="text-[11px] font-mono text-ink-ghost">{exam.confidence}% confidence</span>
              </div>
            </>
          ) : (
            <p className="text-xs text-ink-faint mt-1">Take a quiz to unlock prediction</p>
          )}
        </PaperCard>

        <PaperCard>
          <p className="section-label mb-2">weak topics</p>
          {!weak || weak.length === 0 ? (
            <p className="text-xs text-ink-faint">None detected yet — take a quiz first.</p>
          ) : (
            <ul className="space-y-1">
              {weak.slice(0, 4).map(t => (
                <li key={t.name} className="flex items-center justify-between text-xs">
                  <span className="text-ink-soft truncate max-w-[140px]">{t.name}</span>
                  <span className="font-mono text-status-red">{t.mastery}%</span>
                </li>
              ))}
            </ul>
          )}
        </PaperCard>
      </div>

      {/* Documents + Topics strip */}
      <PaperCard>
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">uploaded sources</p>
          <Link to={`/workspaces/${id}/material`} className="btn-outline py-1 text-xs">
            Manage <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {!ws ? (
          <div className="flex items-center gap-2 text-xs text-ink-faint"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…</div>
        ) : ws.documents.length === 0 ? (
          <p className="text-xs text-ink-faint">No documents yet — upload notes or a PDF to start.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {ws.documents.map(d => (
              <span key={d.id} className="tag">
                {d.source_type === 'pdf' ? '📄' : d.source_type === 'youtube' ? '▶' : '📝'} {d.title} · {d.word_count} w
              </span>
            ))}
          </div>
        )}
      </PaperCard>

      {/* Quick nav */}
      <div>
        <p className="section-label mb-3">navigate workspace</p>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
          {quickLinks.map(({ label, path, icon: Icon }) => (
            <Link key={path} to={`/workspaces/${id}/${path}`}>
              <PaperCard interactive className="flex items-center gap-2 !p-3">
                <Icon className="h-4 w-4 text-ink-faint" />
                <span className="text-xs font-medium text-ink">{label}</span>
              </PaperCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
