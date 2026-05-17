import { Layers, RotateCcw, CheckCircle2 } from 'lucide-react';
import PaperCard from '@/components/forge/PaperCard';
import EmptyState from '@/components/forge/EmptyState';

export default function FlashcardsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* SRS stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <PaperCard className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-ink-faint" />
          <div>
            <p className="section-label">due today</p>
            <p className="text-xl font-bold font-mono text-ink">0</p>
          </div>
        </PaperCard>
        <PaperCard className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-ink-faint" />
          <div>
            <p className="section-label">reviewed</p>
            <p className="text-xl font-bold font-mono text-ink">0</p>
          </div>
        </PaperCard>
        <PaperCard className="flex items-center gap-3">
          <RotateCcw className="h-5 w-5 text-ink-faint" />
          <div>
            <p className="section-label">retention</p>
            <p className="text-xl font-bold font-mono text-ink">—%</p>
          </div>
        </PaperCard>
      </div>

      <PaperCard>
        <p className="section-label mb-2">spaced repetition engine</p>
        <p className="text-xs text-ink-faint mb-4">
          Flashcards are auto-generated from your uploaded study material.
          The SM-2 scheduler decides what to review today based on ease,
          interval, and your last rating. Each card is linked back to its
          source chunk so you can ask the copilot to explain it.
        </p>
        <button
          type="button"
          disabled
          className="btn-ink opacity-40 cursor-not-allowed text-xs"
        >
          Generate flashcards — wired Phase 3
        </button>
      </PaperCard>

      <PaperCard>
        <p className="section-label mb-4">flashcard deck</p>
        <EmptyState
          icon={<Layers className="h-7 w-7" />}
          title="No flashcards yet"
          description="Flashcards are generated from uploaded content, linked to source chunks, and scheduled with the SM-2 spaced repetition algorithm."
        />
        <p className="mt-3 text-[11px] font-mono text-ink-ghost">
          ✦ SM-2 engine + flashcard CRUD wired in Phase 3
        </p>
      </PaperCard>
    </div>
  );
}
