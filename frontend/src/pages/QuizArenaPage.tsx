import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Target, ChevronRight, Clock, CheckCircle2, XCircle, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import PaperCard from '@/components/forge/PaperCard';
import ProgressRing from '@/components/forge/ProgressRing';
import EmptyState from '@/components/forge/EmptyState';
import { useWorkspaceDetail, useWorkspaceRawText, useGenerateQuiz, useSubmitQuiz } from '@/hooks/useWorkspace';
import type { QuizQuestion, QuizResult } from '@/lib/api';

type Stage = 'setup' | 'quiz' | 'result';

export default function QuizArenaPage() {
  const { id = '' } = useParams();
  const { data: ws }      = useWorkspaceDetail(id);
  const { data: rawData } = useWorkspaceRawText(id);
  const generate = useGenerateQuiz();
  const submit   = useSubmitQuiz();

  const [stage,     setStage]     = useState<Stage>('setup');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizId,    setQuizId]    = useState<string | null>(null);
  const [current,  setCurrent]   = useState(0);
  const [answers,  setAnswers]   = useState<Record<number, string>>({});
  const [result,   setResult]    = useState<QuizResult | null>(null);
  const [elapsed,  setElapsed]   = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [numQ,      setNumQ]      = useState(10);
  const [difficulty,setDifficulty]= useState('mixed');

  useEffect(() => {
    if (stage === 'quiz') timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage]);

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  function handleStart() {
    // Use real raw text from ingested docs; fallback to subject name seed
    const seedText = rawData && rawData.word_count >= 20
      ? rawData.text
      : (ws?.subject ?? 'General') + ' fundamentals and key concepts for exam preparation. '.repeat(10);

    generate.mutate(
      { workspace_id: id, text: seedText, num_questions: numQ, difficulty },
      { onSuccess: (res) => { setQuestions(res.questions); setQuizId(res.quiz_id); setCurrent(0); setAnswers({}); setElapsed(0); setStage('quiz'); } },
    );
  }

  function handleNext() {
    if (current < questions.length - 1) setCurrent(c => c + 1);
    else {
      const payload = questions.map((q, i) => ({ question: q.question, user_answer: answers[i] ?? '', correct_answer: q.correct_answer, topic: q.topic }));
      submit.mutate(
        { quiz_id: quizId ?? '', workspace_id: id, answers: payload, time_taken: elapsed, subject: ws?.subject },
        { onSuccess: (res) => { setResult(res); setStage('result'); } },
      );
    }
  }

  if (stage === 'setup') return (
    <div className="space-y-4 animate-fade-up max-w-xl">
      <PaperCard>
        <p className="section-label mb-4">quiz setup</p>
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-mono text-ink-faint">Questions</label>
            <div className="flex gap-2 mt-1">{[5,10,15,20].map(n => (<button key={n} type="button" onClick={()=>setNumQ(n)} className={numQ===n?'tag-solid':'tag cursor-pointer'}>{n}</button>))}</div>
          </div>
          <div>
            <label className="text-[11px] font-mono text-ink-faint">Difficulty</label>
            <div className="flex gap-2 mt-1">{['easy','medium','hard','mixed'].map(d=>(<button key={d} type="button" onClick={()=>setDifficulty(d)} className={difficulty===d?'tag-solid':'tag cursor-pointer capitalize'}>{d}</button>))}</div>
          </div>
          {rawData && rawData.doc_count > 0 ? (
            <p className="text-xs text-ink-faint">{rawData.doc_count} source(s) loaded · {rawData.word_count.toLocaleString()} words · {ws?.subject}</p>
          ) : (
            <p className="text-xs text-status-amber flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />No docs yet — quiz will use subject name only. Upload notes for better questions.</p>
          )}
          <button onClick={handleStart} disabled={generate.isPending} className="btn-ink w-full justify-center">
            {generate.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : <><Target className="h-4 w-4" /> Start quiz</>}
          </button>
          {generate.isError && <p className="text-xs text-status-red">{generate.error?.message}</p>}
        </div>
      </PaperCard>
    </div>
  );

  if (stage === 'quiz') {
    const q = questions[current];
    const answered = answers[current];
    return (
      <div className="space-y-4 animate-fade-up max-w-2xl">
        <div className="flex items-center justify-between">
          <div className="flex-1 h-1.5 bg-forge-rule rounded-full overflow-hidden mr-4">
            <div className="h-full bg-ink transition-all" style={{width:`${((current+1)/questions.length)*100}%`}} />
          </div>
          <span className="text-[11px] font-mono text-ink-faint shrink-0 flex items-center gap-1"><Clock className="h-3 w-3" />{fmt(elapsed)}</span>
          <span className="text-[11px] font-mono text-ink-faint ml-3">{current+1}/{questions.length}</span>
        </div>
        <PaperCard>
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-semibold text-ink leading-relaxed flex-1">{q.question}</p>
            <span className="tag ml-3 shrink-0">{q.difficulty}</span>
          </div>
          <div className="space-y-2">
            {q.options.map(opt => (
              <button key={opt} type="button" onClick={() => setAnswers(a=>({...a,[current]:opt}))}
                className={`w-full text-left px-4 py-2.5 rounded-md border text-sm transition-colors ${
                  answered===opt ? 'border-ink bg-ink text-paper' : 'border-forge-rule bg-paper hover:bg-paper-dark text-ink'
                }`}>{opt}</button>
            ))}
          </div>
        </PaperCard>
        <div className="flex gap-2">
          <button onClick={handleNext} disabled={!answered||submit.isPending} className="btn-ink">
            {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : current===questions.length-1 ? 'Submit quiz' : <><ChevronRight className="h-4 w-4" />Next</>}
          </button>
          <button type="button" onClick={handleNext} className="btn-outline text-xs">Skip</button>
        </div>
      </div>
    );
  }

  if (stage === 'result' && result) return (
    <div className="space-y-4 animate-fade-up">
      <div className="grid gap-3 sm:grid-cols-3">
        <PaperCard className="flex items-center gap-4">
          <ProgressRing value={Math.round(result.accuracy)} label="score" />
          <div>
            <p className="section-label">result</p>
            <p className="text-sm font-semibold text-ink">{result.correct}/{result.total} correct</p>
            <p className="text-xs text-ink-faint">{fmt(elapsed)}</p>
          </div>
        </PaperCard>
        <PaperCard>
          <p className="section-label mb-1">exam prediction</p>
          <p className="text-2xl font-bold font-mono text-ink">{result.exam_prediction.predicted_score}%</p>
          <span className={`tag mt-1 ${
            result.exam_prediction.readiness==='High'?'bg-status-green/10 text-status-green'
            :result.exam_prediction.readiness==='Medium'?'bg-status-amber/10 text-status-amber'
            :'bg-status-red/10 text-status-red'
          }`}>{result.exam_prediction.readiness} readiness</span>
        </PaperCard>
        <PaperCard>
          <p className="section-label mb-2">ability trend</p>
          <p className="text-lg font-bold font-mono text-ink">{result.knowledge.ability}%</p>
          <p className="text-xs text-ink-faint capitalize">{result.knowledge.trend} · {result.knowledge.attempts} attempts</p>
        </PaperCard>
      </div>
      <PaperCard>
        <p className="section-label mb-2">feedback</p>
        <p className="text-sm text-ink-soft">{result.feedback}</p>
        {result.suggestions.length > 0 && (
          <ul className="mt-3 space-y-1">
            {result.suggestions.map((s,i) => <li key={i} className="text-xs text-ink-faint flex items-start gap-1.5"><XCircle className="h-3.5 w-3.5 text-status-red mt-0.5 shrink-0"/>{s}</li>)}
          </ul>
        )}
      </PaperCard>
      <PaperCard>
        <p className="section-label mb-3">answer review</p>
        <div className="space-y-3">
          {questions.map((q,i) => {
            const ua=answers[i]??'—'; const correct=ua===q.correct_answer;
            return (
              <div key={q.id} className="flex gap-3 text-xs">
                <div className="shrink-0 mt-0.5">{correct?<CheckCircle2 className="h-4 w-4 text-status-green"/>:<XCircle className="h-4 w-4 text-status-red"/>}</div>
                <div>
                  <p className="text-ink font-medium mb-0.5">{q.question}</p>
                  <p className="text-ink-faint">Your answer: <span className={correct?'text-status-green':'text-status-red'}>{ua}</span></p>
                  {!correct&&<p className="text-ink-faint">Correct: <span className="text-status-green">{q.correct_answer}</span></p>}
                </div>
              </div>
            );
          })}
        </div>
      </PaperCard>
      <button onClick={()=>setStage('setup')} className="btn-outline"><RotateCcw className="h-4 w-4"/>Retake quiz</button>
    </div>
  );

  return <EmptyState icon={<Target className="h-7 w-7"/>} title="Quiz" description="" />;
}
