import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import PaperCard from '@/components/forge/PaperCard';
import EmptyState from '@/components/forge/EmptyState';

export default function PlannerPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Planner header */}
      <PaperCard>
        <p className="section-label mb-2">AI study planner</p>
        <p className="text-xs text-ink-faint leading-relaxed">
          The planner combines your exam countdown, weak-topic scores (NB08),
          concept difficulty rankings (NB08), due flashcards, and recent session
          performance to generate a day-by-day revision schedule. It re-plans
          automatically when you miss a session or a quiz reveals new weak areas.
        </p>
      </PaperCard>

      {/* Today */}
      <div className="grid gap-3 sm:grid-cols-3">
        <PaperCard className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-ink-faint" />
          <div>
            <p className="section-label">today's sessions</p>
            <p className="text-xl font-bold font-mono text-ink">—</p>
          </div>
        </PaperCard>
        <PaperCard className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-ink-faint" />
          <div>
            <p className="section-label">estimated hours</p>
            <p className="text-xl font-bold font-mono text-ink">—</p>
          </div>
        </PaperCard>
        <PaperCard className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-ink-faint" />
          <div>
            <p className="section-label">at-risk topics</p>
            <p className="text-xl font-bold font-mono text-ink">—</p>
          </div>
        </PaperCard>
      </div>

      {/* Weekly plan */}
      <PaperCard>
        <p className="section-label mb-4">this week</p>
        <EmptyState
          icon={<Calendar className="h-7 w-7" />}
          title="No plan generated yet"
          description="Set your exam date and complete an initial quiz. The Study Time Optimizer (NB07) will generate a prioritised weekly revision plan."
        />
        <p className="mt-3 text-[11px] font-mono text-ink-ghost">
          ✦ Planner generation + drag-drop reschedule wired in Phase 3
        </p>
      </PaperCard>
    </div>
  );
}
