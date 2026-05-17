import { Target, Clock, TrendingUp } from 'lucide-react';
import PaperCard from '@/components/forge/PaperCard';
import EmptyState from '@/components/forge/EmptyState';

export default function QuizArenaPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-3">
        <PaperCard className="flex items-center gap-3">
          <Target className="h-5 w-5 text-ink-faint" />
          <div>
            <p className="section-label">avg score</p>
            <p className="text-xl font-bold font-mono text-ink">—%</p>
          </div>
        </PaperCard>
        <PaperCard className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-ink-faint" />
          <div>
            <p className="section-label">quizzes taken</p>
            <p className="text-xl font-bold font-mono text-ink">0</p>
          </div>
        </PaperCard>
        <PaperCard className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-ink-faint" />
          <div>
            <p className="section-label">predicted score</p>
            <p className="text-xl font-bold font-mono text-ink">—%</p>
          </div>
        </PaperCard>
      </div>

      {/* Generate quiz */}
      <PaperCard>
        <p className="section-label mb-2">generate quiz</p>
        <p className="text-xs text-ink-faint mb-4">
          Quiz generation uses your trained Quiz Difficulty Classifier (NB01) and
          Knowledge Tracing model (NB05) to adapt question difficulty to your
          current mastery level. Upload study material first.
        </p>
        <button
          type="button"
          disabled
          className="btn-ink opacity-40 cursor-not-allowed text-xs"
        >
          Generate adaptive quiz — wired Phase 2
        </button>
      </PaperCard>

      {/* History */}
      <PaperCard>
        <p className="section-label mb-4">quiz history</p>
        <EmptyState
          icon={<Target className="h-7 w-7" />}
          title="No quiz attempts yet"
          description="Once you take a quiz, attempts are persisted and fed into the Knowledge Tracing and Exam Score Predictor models."
        />
        <p className="mt-3 text-[11px] font-mono text-ink-ghost">
          ✦ Quiz submission + ML inference wired in Phase 2
        </p>
      </PaperCard>
    </div>
  );
}
