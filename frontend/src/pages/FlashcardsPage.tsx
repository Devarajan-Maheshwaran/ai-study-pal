import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { CountUp } from '@/components/reactbits/CountUp';
import { FlashIcon, ArrowRightIcon, ChevronRightIcon, CloseIcon } from '@/components/icons';
import { useFlashcards, useGenerateFlashcards, useReviewFlashcard } from '@/hooks/useWorkspace';
import type { Flashcard } from '@/lib/api';

type Mode = 'browse' | 'review';

export default function FlashcardsPage() {
  const { id = '' } = useParams();
  const { data, isLoading } = useFlashcards(id);
  const generate = useGenerateFlashcards();
  const review   = useReviewFlashcard(id);

  const [mode,    setMode]    = useState<Mode>('browse');
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [genText, setGenText] = useState('');
  const [showGen, setShowGen] = useState(false);

  const allCards:  Flashcard[] = data?.cards ?? [];
  const dueCards:  Flashcard[] = allCards.filter(c => c.due);
  const deck:      Flashcard[] = mode === 'review' ? dueCards : allCards;
  const card:      Flashcard | undefined = deck[cardIdx];

  function handleReview(quality: number) {
    if (!card) return;
    review.mutate(
      { cardId: card.id, quality },
      {
        onSuccess: () => {
          setFlipped(false);
          setCardIdx(i => Math.min(i + 1, deck.length - 1));
        },
      },
    );
  }

  return (
    <div className="min-h-screen px-5 py-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <p className="label-section mb-1">Workspace</p>
          <h1 className="font-syne text-2xl font-bold text-[var(--text-primary)]">Flashcards</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Spaced-repetition review powered by the SM-2 algorithm.</p>
        </motion.div>

        {/* Mode selector + generate button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex gap-2">
            {(['browse', 'review'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setCardIdx(0); setFlipped(false); }}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                  mode === m
                    ? 'bg-[var(--text-primary)] text-[var(--bg)]'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {m === 'browse' ? `All (${allCards.length})` : `Due (${dueCards.length})`}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowGen(v => !v)}
            className="btn-ghost text-sm"
          >
            <FlashIcon size={15} /> Generate cards
          </button>
        </motion.div>

        {/* Generate panel */}
        <AnimatePresence>
          {showGen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{    opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <SpotlightCard className="p-5">
                <p className="font-syne font-semibold text-[var(--text-primary)] mb-3">Generate Flashcards</p>
                <textarea
                  value={genText}
                  onChange={e => setGenText(e.target.value)}
                  placeholder="Paste topic notes or text to auto-generate cards (min 20 words)..."
                  rows={4}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-y mb-3"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={generate.isPending || genText.split(' ').length < 20}
                    onClick={() =>
                      generate.mutate(
                        { wsId: id, text: genText },
                        { onSuccess: () => { setShowGen(false); setGenText(''); } },
                      )
                    }
                    className="btn-primary text-sm"
                  >
                    {generate.isPending ? (
                      <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                      </svg>
                    ) : <FlashIcon size={15} />}
                    {generate.isPending ? 'Generating...' : 'Generate'}
                  </button>
                  <button onClick={() => setShowGen(false)} className="btn-ghost text-sm">Cancel</button>
                </div>
                {generate.isError && (
                  <p className="mt-2 text-xs" style={{ color: '#dc2626' }}>{generate.error?.message}</p>
                )}
              </SpotlightCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="skeleton h-40 w-full rounded-2xl" />)}
          </div>
        )}

        {/* Empty */}
        {!isLoading && deck.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-4 text-center"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}
            >
              <FlashIcon size={24} className="text-[var(--text-faint)]" />
            </div>
            <div>
              <p className="font-syne font-semibold text-[var(--text-primary)] mb-1">
                {mode === 'review' ? 'All caught up!' : 'No flashcards yet'}
              </p>
              <p className="text-sm text-[var(--text-muted)] max-w-xs">
                {mode === 'review'
                  ? 'No cards due for review. Switch to All to browse your deck.'
                  : 'Generate flashcards from your notes using the button above.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Progress */}
        {!isLoading && deck.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="space-y-5"
          >
            <div
              className="rounded-2xl px-5 py-4 flex items-center justify-between"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <div>
                <p className="label-section mb-0.5">Progress</p>
                <p className="font-syne font-bold text-[var(--text-primary)]">
                  {cardIdx + 1} / {deck.length}
                </p>
              </div>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(var(--text-primary) ${(cardIdx / deck.length) * 360}deg, var(--bg-subtle) 0deg)`,
                }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-mono text-xs font-medium"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}
                >
                  {Math.round((cardIdx / deck.length) * 100)}%
                </div>
              </div>
            </div>

            {/* Flashcard */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${cardIdx}-${flipped}`}
                initial={{ opacity: 0, rotateY: flipped ? -90 : 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{    opacity: 0 }}
                transition={{ duration: 0.28 }}
                style={{ perspective: 1000 }}
              >
                <div
                  className="rounded-2xl p-8 min-h-[200px] flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200"
                  style={{
                    background: flipped ? 'var(--text-primary)' : 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                  }}
                  onClick={() => setFlipped(f => !f)}
                  role="button"
                  aria-label="Flip card"
                >
                  <p
                    className="label-section mb-4"
                    style={{ color: flipped ? 'rgba(255,255,255,0.4)' : undefined }}
                  >
                    {flipped ? 'answer' : 'question — tap to flip'}
                  </p>
                  <p
                    className="text-base font-medium leading-relaxed max-w-md"
                    style={{ color: flipped ? 'var(--bg)' : 'var(--text-primary)' }}
                  >
                    {flipped ? card?.back : card?.front}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* SM-2 rating buttons */}
            {flipped && mode === 'review' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 flex-wrap"
              >
                {([
                  { q: 0, label: 'Blackout', color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
                  { q: 2, label: 'Hard',     color: '#d97706', bg: 'rgba(217,119,6,0.08)'  },
                  { q: 3, label: 'Good',     color: 'var(--text-muted)', bg: 'var(--bg-subtle)' },
                  { q: 5, label: 'Easy',     color: '#16a34a', bg: 'rgba(22,163,74,0.08)'  },
                ] as const).map(({ q, label, color, bg }) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleReview(q)}
                    disabled={review.isPending}
                    className="px-4 py-2 rounded-full text-sm font-medium border transition-opacity hover:opacity-80"
                    style={{
                      background: bg,
                      color,
                      borderColor: color,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Browse navigation */}
            {mode === 'browse' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setCardIdx(i => Math.max(0, i - 1)); setFlipped(false); }}
                  disabled={cardIdx === 0}
                  className="btn-ghost text-sm"
                >
                  <ArrowRightIcon size={14} style={{ transform: 'scaleX(-1)' }} /> Prev
                </button>
                <button
                  type="button"
                  onClick={() => { setCardIdx(i => Math.min(deck.length - 1, i + 1)); setFlipped(false); }}
                  className="btn-ghost text-sm"
                >
                  <ChevronRightIcon size={14} /> Next
                </button>
                <button
                  type="button"
                  onClick={() => { setCardIdx(0); setFlipped(false); }}
                  className="btn-ghost text-sm"
                >
                  <CloseIcon size={14} /> Reset
                </button>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}
