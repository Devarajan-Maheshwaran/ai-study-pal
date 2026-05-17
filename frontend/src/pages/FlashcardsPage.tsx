import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Zap, RotateCcw, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import PaperCard from '@/components/forge/PaperCard';
import EmptyState from '@/components/forge/EmptyState';
import ProgressRing from '@/components/forge/ProgressRing';
import { useFlashcards, useGenerateFlashcards, useReviewFlashcard } from '@/hooks/useWorkspace';
import type { Flashcard } from '@/lib/api';

export default function FlashcardsPage() {
  const { id = '' } = useParams();
  const { data, isLoading } = useFlashcards(id);
  const generate = useGenerateFlashcards();
  const review   = useReviewFlashcard(id);

  const [mode,     setMode]     = useState<'browse' | 'review'>('browse');
  const [cardIdx,  setCardIdx]  = useState(0);
  const [flipped,  setFlipped]  = useState(false);
  const [genText,  setGenText]  = useState('');
  const [showGen,  setShowGen]  = useState(false);

  const allCards  = data?.cards ?? [];
  const dueCards  = allCards.filter(c => c.due);
  const reviewDeck = mode === 'review' ? dueCards : allCards;
  const card: Flashcard | undefined = reviewDeck[cardIdx];

  function handleReview(quality: number) {
    if (!card) return;
    review.mutate({ cardId: card.id, quality }, {
      onSuccess: () => {
        setFlipped(false);
        setCardIdx(i => Math.min(i + 1, reviewDeck.length - 1));
      },
    });
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Header strip */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-2">
          <button type="button" onClick={() => { setMode('browse'); setCardIdx(0); setFlipped(false); }}
            className={mode === 'browse' ? 'tag-solid' : 'tag cursor-pointer'}>All ({allCards.length})</button>
          <button type="button" onClick={() => { setMode('review'); setCardIdx(0); setFlipped(false); }}
            className={mode === 'review' ? 'tag-solid' : 'tag cursor-pointer'}>Due ({dueCards.length})</button>
        </div>
        <button type="button" onClick={() => setShowGen(v => !v)} className="btn-outline text-xs ml-auto">
          <Zap className="h-3.5 w-3.5" /> Generate cards
        </button>
      </div>

      {/* Generate panel */}
      {showGen && (
        <PaperCard className="animate-scale-in">
          <p className="section-label mb-3">generate flashcards</p>
          <textarea
            value={genText}
            onChange={e => setGenText(e.target.value)}
            placeholder="Paste notes or topic text to auto-generate cards…"
            rows={4}
            className="w-full rounded-md border border-forge-rule bg-paper px-3 py-2 text-sm text-ink placeholder-ink-ghost outline-none focus:ring-2 focus:ring-ink/15 resize-y mb-3"
          />
          <button
            type="button"
            disabled={generate.isPending || genText.split(' ').length < 20}
            onClick={() => generate.mutate({ wsId: id, text: genText }, { onSuccess: () => { setShowGen(false); setGenText(''); } })}
            className="btn-ink text-xs"
          >
            {generate.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</> : 'Generate'}
          </button>
          {generate.isError && <p className="text-xs text-status-red mt-2">{generate.error?.message}</p>}
        </PaperCard>
      )}

      {/* Card display */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-ink-faint"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…</div>
      ) : reviewDeck.length === 0 ? (
        <EmptyState
          icon={<Zap className="h-7 w-7" />}
          title={mode === 'review' ? 'All caught up!' : 'No flashcards yet'}
          description={mode === 'review' ? 'No cards due for review. Come back tomorrow or switch to All.' : 'Generate flashcards from your notes using the button above.'}
        />
      ) : (
        <>
          {/* Progress */}
          <div className="flex items-center gap-3">
            <ProgressRing value={Math.round(((cardIdx) / reviewDeck.length) * 100)} label="done" size={48} />
            <div className="text-xs text-ink-faint font-mono">
              <p>{cardIdx + 1} / {reviewDeck.length}</p>
              {mode === 'review' && <p>{dueCards.length} due for review</p>}
            </div>
          </div>

          {/* Flashcard */}
          <div
            className="cursor-pointer"
            onClick={() => setFlipped(f => !f)}
            role="button"
            aria-label="Flip card"
          >
            <PaperCard className={`min-h-[180px] flex items-center justify-center transition-all ${
              flipped ? 'bg-ink text-paper' : ''
            }`}>
              <div className="text-center p-4">
                <p className="text-[10px] font-mono uppercase tracking-wide mb-3 opacity-50">
                  {flipped ? 'answer' : 'question — tap to flip'}
                </p>
                <p className={`text-sm font-medium leading-relaxed ${flipped ? 'text-paper' : 'text-ink'}`}>
                  {flipped ? card.back : card.front}
                </p>
              </div>
            </PaperCard>
          </div>

          {/* SM-2 rating buttons (shown after flip) */}
          {flipped && mode === 'review' && (
            <div className="flex gap-2 flex-wrap">
              {([
                { q: 0, label: 'Blackout',   cls: 'bg-status-red/10 text-status-red border-status-red/20' },
                { q: 2, label: 'Hard',       cls: 'bg-status-amber/10 text-status-amber border-status-amber/20' },
                { q: 3, label: 'Good',       cls: 'bg-paper border-forge-rule text-ink' },
                { q: 5, label: 'Easy',       cls: 'bg-status-green/10 text-status-green border-status-green/20' },
              ] as const).map(({ q, label, cls }) => (
                <button key={q} type="button"
                  onClick={() => handleReview(q)}
                  disabled={review.isPending}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-opacity hover:opacity-80 ${cls}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Browse navigation */}
          {mode === 'browse' && (
            <div className="flex gap-2">
              <button type="button" onClick={() => { setCardIdx(i => Math.max(0, i - 1)); setFlipped(false); }} className="btn-outline text-xs" disabled={cardIdx === 0}>Prev</button>
              <button type="button" onClick={() => { setCardIdx(i => Math.min(reviewDeck.length - 1, i + 1)); setFlipped(false); }} className="btn-outline text-xs">
                <ChevronRight className="h-3.5 w-3.5" /> Next
              </button>
              <button type="button" onClick={() => { setCardIdx(0); setFlipped(false); }} className="btn-outline text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
