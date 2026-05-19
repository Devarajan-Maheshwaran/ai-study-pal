import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { CountUp } from '@/components/reactbits/CountUp';
import {
  FlashIcon, CheckIcon, CloseIcon, ArrowRightIcon, ChevronRightIcon,
} from '@/components/icons';
import {
  useWorkspaceDetail, useWorkspaceRawText,
  useGenerateQuiz, useSubmitQuiz,
} from '@/hooks/useWorkspace';
import type { QuizQuestion, QuizResult } from '@/lib/api';

type Stage = 'setup' | 'quiz' | 'result';

const difficultyOptions = ['easy', 'medium', 'hard', 'mixed'];
const questionCountOptions = [5, 10, 15, 20];

export default function QuizArenaPage() {
  const { id = '' } = useParams();
  const { data: ws }      = useWorkspaceDetail(id);
  const { data: rawData } = useWorkspaceRawText(id);
  const generate = useGenerateQuiz();
  const submit   = useSubmitQuiz();

  const [stage,      setStage]      = useState<Stage>('setup');
  const [questions,  setQuestions]  = useState<QuizQuestion[]>([]);
  const [quizId,     setQuizId]     = useState<string | null>(null);
  const [current,    setCurrent]    = useState(0);
  const [answers,    setAnswers]    = useState<Record<number, string>>({});
  const [result,     setResult]     = useState<QuizResult | null>(null);
  const [elapsed,    setElapsed]    = useState(0);
  const [numQ,       setNumQ]       = useState(10);
  const [difficulty, setDifficulty] = useState('mixed');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (stage === 'quiz') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  function handleStart() {
    const seedText =
      rawData && rawData.word_count >= 20
        ? rawData.text
        : (ws?.subject ?? 'General') + ' fundamentals and key concepts. '.repeat(10);

    generate.mutate(
      { workspace_id: id, text: seedText, num_questions: numQ, difficulty },
      {
        onSuccess: res => {
          setQuestions(res.questions);
          setQuizId(res.quiz_id);
          setCurrent(0);
          setAnswers({});
          setElapsed(0);
          setStage('quiz');
        },
      },
    );
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      const payload = questions.map((q, i) => ({
        question:       q.question,
        user_answer:    answers[i] ?? '',
        correct_answer: q.correct_answer,
        topic:          q.topic,
      }));
      submit.mutate(
        { quiz_id: quizId ?? '', workspace_id: id, answers: payload, time_taken: elapsed, subject: ws?.subject },
        { onSuccess: res => { setResult(res); setStage('result'); } },
      );
    }
  }

  /* ---- Setup screen ---- */
  if (stage === 'setup') return (
    <div className="min-h-screen px-5 py-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <p className="label-section mb-1">Workspace</p>
          <h1 className="font-syne text-2xl font-bold text-[var(--text-primary)]">Quiz Arena</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Configure and generate a quiz from your study material.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <SpotlightCard className="p-6">
            <div className="space-y-5">
              <div>
                <p className="label-section mb-2">Number of questions</p>
                <div className="flex gap-2 flex-wrap">
                  {questionCountOptions.map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNumQ(n)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        numQ === n
                          ? 'bg-[var(--text-primary)] text-[var(--bg)]'
                          : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="label-section mb-2">Difficulty</p>
                <div className="flex gap-2 flex-wrap">
                  {difficultyOptions.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                        difficulty === d
                          ? 'bg-[var(--text-primary)] text-[var(--bg)]'
                          : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {rawData && rawData.doc_count > 0 ? (
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  {rawData.doc_count} source{rawData.doc_count > 1 ? 's' : ''} loaded
                  &nbsp;·&nbsp;{rawData.word_count.toLocaleString()} words
                </p>
              ) : (
                <p className="text-xs" style={{ color: '#d97706' }}>
                  No documents uploaded yet. Quiz will use subject name only.
                </p>
              )}

              <button
                onClick={handleStart}
                disabled={generate.isPending}
                className="btn-primary w-full justify-center"
              >
                {generate.isPending ? (
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                  </svg>
                ) : <FlashIcon size={16} />}
                {generate.isPending ? 'Generating quiz...' : 'Start Quiz'}
              </button>

              {generate.isError && (
                <p className="text-xs" style={{ color: '#dc2626' }}>{generate.error?.message}</p>
              )}
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </div>
  );

  /* ---- Quiz screen ---- */
  if (stage === 'quiz') {
    const q        = questions[current];
    const answered = answers[current];
    const progress = ((current + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen px-5 py-8" style={{ background: 'var(--bg)' }}>
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Progress bar + timer */}
          <div className="flex items-center gap-4">
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--bg-subtle)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--text-primary)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="font-mono text-xs text-[var(--text-faint)] shrink-0">{fmt(elapsed)}</span>
            <span className="font-mono text-xs text-[var(--text-faint)] shrink-0">
              {current + 1}/{questions.length}
            </span>
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
            >
              <SpotlightCard className="p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <p className="font-syne font-semibold text-[var(--text-primary)] leading-relaxed flex-1">
                    {q.question}
                  </p>
                  <span
                    className="text-[11px] px-2.5 py-1 rounded-full shrink-0 capitalize"
                    style={{
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {q.difficulty}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {q.options.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswers(a => ({ ...a, [current]: opt }))}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: answered === opt ? 'var(--text-primary)' : 'var(--bg-subtle)',
                        color:      answered === opt ? 'var(--bg)' : 'var(--text-muted)',
                        border:     `1px solid ${
                          answered === opt ? 'var(--text-primary)' : 'var(--border-color)'
                        }`,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </SpotlightCard>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-2">
            <button
              onClick={handleNext}
              disabled={!answered || submit.isPending}
              className="btn-primary"
            >
              {submit.isPending ? (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                </svg>
              ) : current === questions.length - 1 ? 'Submit Quiz' : (
                <><ChevronRightIcon size={16} /> Next</>
              )}
            </button>
            <button type="button" onClick={handleNext} className="btn-ghost">
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Results screen ---- */
  if (stage === 'result' && result) return (
    <div className="min-h-screen px-5 py-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto space-y-6">

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <p className="label-section mb-1">Quiz Complete</p>
          <h1 className="font-syne text-2xl font-bold text-[var(--text-primary)]">Results</h1>
        </motion.div>

        {/* Score row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <SpotlightCard className="p-5">
              <p className="label-section mb-2">Score</p>
              <span className="font-syne text-4xl font-extrabold text-[var(--text-primary)]">
                <CountUp to={Math.round(result.accuracy)} suffix="%" />
              </span>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {result.correct}/{result.total} correct · {fmt(elapsed)}
              </p>
            </SpotlightCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <SpotlightCard className="p-5">
              <p className="label-section mb-2">Exam Prediction</p>
              <span className="font-syne text-4xl font-extrabold text-[var(--text-primary)]">
                <CountUp to={result.exam_prediction.predicted_score} suffix="%" />
              </span>
              <span
                className="mt-1 inline-block text-[11px] px-2 py-0.5 rounded-full"
                style={{
                  background:
                    result.exam_prediction.readiness === 'High'   ? 'rgba(22,163,74,0.1)' :
                    result.exam_prediction.readiness === 'Medium' ? 'rgba(217,119,6,0.1)' : 'rgba(220,38,38,0.1)',
                  color:
                    result.exam_prediction.readiness === 'High'   ? '#16a34a' :
                    result.exam_prediction.readiness === 'Medium' ? '#d97706' : '#dc2626',
                }}
              >
                {result.exam_prediction.readiness} readiness
              </span>
            </SpotlightCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <SpotlightCard className="p-5">
              <p className="label-section mb-2">Knowledge Trend</p>
              <p className="font-syne text-xl font-bold text-[var(--text-primary)] capitalize">
                {result.knowledge.trend}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {result.knowledge.ability}% ability · {result.knowledge.attempts} attempts
              </p>
            </SpotlightCard>
          </motion.div>
        </div>

        {/* Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <p className="label-section mb-2">Feedback</p>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{result.feedback}</p>
          {result.suggestions.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {result.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                  <CloseIcon size={13} style={{ color: '#dc2626', marginTop: 2, flexShrink: 0 }} />
                  {s}
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Answer review */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <p className="label-section mb-4">Answer Review</p>
          <div className="space-y-4">
            {questions.map((q, i) => {
              const ua      = answers[i] ?? '—';
              const correct = ua === q.correct_answer;
              return (
                <div key={q.id} className="flex gap-3 text-sm">
                  <div className="shrink-0 mt-0.5">
                    {correct
                      ? <CheckIcon size={15} style={{ color: '#16a34a' }} />
                      : <CloseIcon size={15} style={{ color: '#dc2626' }} />}
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium mb-0.5">{q.question}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Your answer:&nbsp;
                      <span style={{ color: correct ? '#16a34a' : '#dc2626' }}>{ua}</span>
                    </p>
                    {!correct && (
                      <p className="text-xs text-[var(--text-muted)]">
                        Correct:&nbsp;
                        <span style={{ color: '#16a34a' }}>{q.correct_answer}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <button onClick={() => setStage('setup')} className="btn-ghost">
          <ArrowRightIcon size={15} style={{ transform: 'scaleX(-1)' }} /> Retake Quiz
        </button>
      </div>
    </div>
  );

  return null;
}
