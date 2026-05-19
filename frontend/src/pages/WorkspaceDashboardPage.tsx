import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { CountUp } from '@/components/reactbits/CountUp';
import {
  BookIcon, FlashIcon, FolderIcon, ChartIcon,
  CalendarIcon, ChatIcon, ArrowRightIcon, BrainIcon,
} from '@/components/icons';
import { useWorkspaceDetail, useProgress, useExamPrediction, useWeakTopics } from '@/hooks/useWorkspace';

const quickLinks = [
  { label: 'Materials',  path: 'material',   icon: BookIcon,     desc: 'Upload & manage documents' },
  { label: 'Quiz Arena', path: 'quiz',        icon: FlashIcon,    desc: 'Generate & take quizzes' },
  { label: 'Flashcards', path: 'flashcards',  icon: FolderIcon,   desc: 'Spaced-repetition review' },
  { label: 'AI Copilot', path: 'copilot',     icon: BrainIcon,    desc: 'Ask your study material' },
  { label: 'Analytics',  path: 'analytics',   icon: ChartIcon,    desc: 'Track your progress' },
  { label: 'Planner',    path: 'planner',     icon: CalendarIcon, desc: 'Build a study schedule' },
];

export default function WorkspaceDashboardPage() {
  const { id = '' } = useParams();
  const navigate    = useNavigate();
  const { data: ws }       = useWorkspaceDetail(id);
  const { data: progress } = useProgress(id);
  const { data: exam }     = useExamPrediction(id);
  const { data: weak }     = useWeakTopics(id);

  const mastery = progress?.average_accuracy ?? 0;

  return (
    <div
      className="min-h-screen px-5 py-8"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="label-section mb-1">Workspace</p>
          <h1 className="font-syne text-2xl font-bold text-[var(--text-primary)] mb-1">
            {ws?.name ?? (
              <span className="skeleton inline-block w-40 h-6 rounded" />
            )}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {ws?.subject ?? ''}
            {ws?.exam_date ? ` — Exam ${ws.exam_date}` : ''}
          </p>
        </motion.div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Mastery */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <SpotlightCard className="p-5 h-full">
              <p className="label-section mb-3">Average Accuracy</p>
              <div className="flex items-end gap-2">
                <span className="font-syne text-4xl font-extrabold text-[var(--text-primary)] leading-none">
                  <CountUp to={Math.round(mastery)} suffix="%" />
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                {progress
                  ? `over ${progress.total_attempts} quiz${progress.total_attempts === 1 ? '' : 'zes'}`
                  : 'Take a quiz to see your score'}
              </p>
            </SpotlightCard>
          </motion.div>

          {/* Exam prediction */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <SpotlightCard className="p-5 h-full">
              <p className="label-section mb-3">Exam Prediction</p>
              {exam?.predicted_score != null ? (
                <>
                  <span className="font-syne text-4xl font-extrabold text-[var(--text-primary)] leading-none">
                    <CountUp to={exam.predicted_score} suffix="%" />
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          exam.readiness === 'High'   ? 'rgba(22,163,74,0.1)' :
                          exam.readiness === 'Medium' ? 'rgba(217,119,6,0.1)' : 'rgba(220,38,38,0.1)',
                        color:
                          exam.readiness === 'High'   ? '#16a34a' :
                          exam.readiness === 'Medium' ? '#d97706' : '#dc2626',
                      }}
                    >
                      {exam.readiness} readiness
                    </span>
                    <span className="text-xs text-[var(--text-faint)]">{exam.confidence}% conf.</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[var(--text-muted)] mt-1">Take a quiz to unlock</p>
              )}
            </SpotlightCard>
          </motion.div>

          {/* Weak topics */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <SpotlightCard className="p-5 h-full">
              <p className="label-section mb-3">Weak Topics</p>
              {!weak || weak.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">None detected yet</p>
              ) : (
                <ul className="space-y-2">
                  {weak.slice(0, 4).map(t => (
                    <li key={t.name} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)] truncate max-w-[130px]">{t.name}</span>
                      <span
                        className="font-mono font-medium"
                        style={{ color: t.mastery < 50 ? '#dc2626' : '#d97706' }}
                      >
                        {t.mastery}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SpotlightCard>
          </motion.div>
        </div>

        {/* Documents strip */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="label-section">Uploaded Sources</p>
              <button
                onClick={() => navigate(`/workspaces/${id}/material`)}
                className="text-xs flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Manage <ArrowRightIcon size={13} />
              </button>
            </div>
            {!ws ? (
              <div className="flex gap-2">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-7 w-28 rounded-full" />)}
              </div>
            ) : ws.documents.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No documents yet — upload notes or a PDF to start.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {ws.documents.map(d => (
                  <span
                    key={d.id}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {d.title} · {d.word_count}w
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick nav grid */}
        <div>
          <p className="label-section mb-4">Navigate Workspace</p>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            {quickLinks.map(({ label, path, icon: Icon, desc }, i) => (
              <motion.div
                key={path}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 + i * 0.05 }}
              >
                <SpotlightCard
                  className="p-4 cursor-pointer group"
                  onClick={() => navigate(`/workspaces/${id}/${path}`)}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}
                  >
                    <Icon size={16} className="text-[var(--text-primary)]" />
                  </div>
                  <p className="font-syne font-semibold text-sm text-[var(--text-primary)] mb-0.5">{label}</p>
                  <p className="text-xs text-[var(--text-muted)] leading-snug">{desc}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
