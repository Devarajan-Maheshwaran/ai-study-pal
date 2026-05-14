import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Brain, Play, CheckCircle2, XCircle, RotateCcw, Trophy,
  Target, ArrowRight, TrendingUp, TrendingDown, Zap, AlertTriangle
} from 'lucide-react';
import { api, QuizQuestion } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

type QuizState = 'idle' | 'config' | 'active' | 'complete';
type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyStats {
  easy: { total: number; correct: number };
  medium: { total: number; correct: number };
  hard: { total: number; correct: number };
}

const AdaptiveQuizSection = () => {
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [quizLength, setQuizLength] = useState<10 | 20>(10);
  const [startLevel, setStartLevel] = useState<Difficulty>('easy');
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Array<{ qid: string; selected: string; correct: string; topic: string }>>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('easy');
  const [difficultyStats, setDifficultyStats] = useState<DifficultyStats>({
    easy: { total: 0, correct: 0 },
    medium: { total: 0, correct: 0 },
    hard: { total: 0, correct: 0 },
  });
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [studyText, setStudyText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const currentQuestion = currentQuestions[currentIndex];

  const startConfig = () => setQuizState('config');

  const fetchAndStart = async () => {
    if (!studyText.trim()) {
      toast({ title: 'No content', description: 'Paste your study notes below to generate a quiz.', variant: 'destructive' });
      return;
    }
    setIsGenerating(true);
    try {
      const res = await api.getAdaptiveQuiz({
        text: studyText,
        subject: 'General',
        num_questions: quizLength,
        difficulty: startLevel,
      });
      if (!res.questions || res.questions.length === 0) {
        toast({ title: 'No questions generated', description: 'Try adding more detailed notes.', variant: 'destructive' });
        return;
      }
      setCurrentQuestions(res.questions);
      setCurrentIndex(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setCurrentDifficulty(startLevel);
      setDifficultyStats({ easy: { total: 0, correct: 0 }, medium: { total: 0, correct: 0 }, hard: { total: 0, correct: 0 } });
      setWeakTopics([]);
      setQuizResult(null);
      setQuizState('active');
    } catch (e: any) {
      toast({ title: 'Error generating quiz', description: e.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (val: string) => {
    if (showFeedback) return;
    setSelectedAnswer(val);
  };

  const submitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    const isCorrect = selectedAnswer === currentQuestion.answer;
    const diff = (currentQuestion.difficulty || 'medium') as Difficulty;

    setDifficultyStats(prev => ({
      ...prev,
      [diff]: { total: prev[diff].total + 1, correct: prev[diff].correct + (isCorrect ? 1 : 0) },
    }));

    if (!isCorrect && currentQuestion.topic) {
      setWeakTopics(prev => prev.includes(currentQuestion.topic) ? prev : [...prev, currentQuestion.topic]);
    }

    // Adaptive difficulty
    if (isCorrect) {
      if (currentDifficulty === 'easy') setCurrentDifficulty('medium');
      else if (currentDifficulty === 'medium') setCurrentDifficulty('hard');
    } else {
      if (currentDifficulty === 'hard') setCurrentDifficulty('medium');
      else if (currentDifficulty === 'medium') setCurrentDifficulty('easy');
    }

    setAnswers(prev => [...prev, {
      qid: currentQuestion.id,
      selected: selectedAnswer,
      correct: currentQuestion.answer,
      topic: currentQuestion.topic || 'General',
    }]);

    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      if (currentIndex < currentQuestions.length - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        finishQuiz();
      }
    }, 1400);
  };

  const finishQuiz = async () => {
    setQuizState('complete');
    try {
      const payload = answers.map((a) => ({
        question_id: a.qid,
        question: '',
        user_answer: a.selected,
        correct_answer: a.correct,
        topic: a.topic,
      }));
      const result = await api.submitQuiz({ subject: 'General', user_id: 'default', answers: payload });
      setQuizResult(result);
    } catch {
      // non-fatal
    }
  };

  const finalScore = answers.filter(a => a.selected === a.correct).length;
  const finalAccuracy = answers.length > 0 ? Math.round((finalScore / answers.length) * 100) : 0;

  const DIFF_COLORS: Record<Difficulty, string> = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Adaptive Quiz
          </CardTitle>
          <CardDescription>Quiz difficulty adjusts in real-time based on your performance.</CardDescription>
        </CardHeader>
        <CardContent>

          {/* IDLE */}
          {quizState === 'idle' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Paste your study notes, choose a length, then start. The quiz adapts as you answer.
              </p>
              <textarea
                className="w-full min-h-[120px] rounded-lg border border-border p-3 text-sm font-mono resize-y bg-background"
                placeholder="Paste your study notes here..."
                value={studyText}
                onChange={e => setStudyText(e.target.value)}
              />
              <Button onClick={startConfig} disabled={!studyText.trim()} className="gap-2">
                <Play className="h-4 w-4" /> Configure Quiz
              </Button>
            </div>
          )}

          {/* CONFIG */}
          {quizState === 'config' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quiz Length</Label>
                <div className="flex gap-3">
                  {([10, 20] as const).map(n => (
                    <button key={n} onClick={() => setQuizLength(n)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        quizLength === n ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                      }`}>
                      {n} questions
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Starting Difficulty</Label>
                <div className="flex gap-3">
                  {(['easy', 'medium'] as const).map(d => (
                    <button key={d} onClick={() => setStartLevel(d)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-colors ${
                        startLevel === d ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                      }`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setQuizState('idle')}>Back</Button>
                <Button onClick={fetchAndStart} disabled={isGenerating} className="gap-2">
                  {isGenerating ? 'Generating...' : <><Zap className="h-4 w-4" /> Start Quiz</>}
                </Button>
              </div>
            </div>
          )}

          {/* ACTIVE */}
          {quizState === 'active' && currentQuestion && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Question {currentIndex + 1} of {currentQuestions.length}
                </span>
                <div className="flex gap-2">
                  <Badge className="text-xs">Adaptive: {currentDifficulty}</Badge>
                  <Badge className={`text-xs ${DIFF_COLORS[currentQuestion.difficulty as Difficulty] || 'bg-gray-100 text-gray-600'}`}>
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
              </div>
              <Progress value={((currentIndex) / currentQuestions.length) * 100} className="h-1.5" />

              {currentQuestion.topic && (
                <Badge variant="outline" className="text-xs">Topic: {currentQuestion.topic}</Badge>
              )}

              <p className="font-medium text-base leading-relaxed">{currentQuestion.question}</p>

              <div className="space-y-2">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedAnswer === opt;
                  const isCorrect = opt === currentQuestion.answer;
                  const showCorrect = showFeedback && isCorrect;
                  const showWrong = showFeedback && isSelected && !isCorrect;
                  return (
                    <button key={idx} onClick={() => handleSelectAnswer(opt)}
                      disabled={showFeedback}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left text-sm transition-all ${
                        showCorrect ? 'border-green-500 bg-green-50 text-green-800' :
                        showWrong   ? 'border-red-400 bg-red-50 text-red-800' :
                        isSelected  ? 'border-primary bg-primary/10' :
                        'border-border hover:border-primary/40 hover:bg-muted/30'
                      }`}>
                      <span className="font-bold text-muted-foreground shrink-0">{String.fromCharCode(65 + idx)}</span>
                      <span className="flex-1">{opt}</span>
                      {showCorrect && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                      {showWrong   && <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {showFeedback && (
                <Alert className={selectedAnswer === currentQuestion.answer ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}>
                  <AlertDescription className="text-sm">
                    {selectedAnswer === currentQuestion.answer
                      ? `✅ Correct! Next question will be ${
                          currentDifficulty === 'hard' ? 'hard' : currentDifficulty === 'medium' ? 'hard' : 'medium'
                        }.`
                      : `❌ The answer is: ${currentQuestion.answer}. Next will be slightly easier.`
                    }
                  </AlertDescription>
                </Alert>
              )}

              {!showFeedback && (
                <Button onClick={submitAnswer} disabled={!selectedAnswer} className="gap-2 w-full">
                  <ArrowRight className="h-4 w-4" /> Submit &amp; Next
                </Button>
              )}
            </div>
          )}

          {/* COMPLETE */}
          {quizState === 'complete' && (
            <div className="space-y-5">
              <div className={`rounded-xl p-6 text-center ${
                finalAccuracy >= 80 ? 'bg-green-50' : finalAccuracy >= 50 ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                <Trophy className={`h-10 w-10 mx-auto mb-2 ${
                  finalAccuracy >= 80 ? 'text-green-500' : finalAccuracy >= 50 ? 'text-yellow-500' : 'text-red-400'
                }`} />
                <h3 className="text-xl font-bold mb-1">Quiz Complete!</h3>
                <p className={`text-3xl font-bold ${
                  finalAccuracy >= 80 ? 'text-green-600' : finalAccuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>{finalAccuracy}%</p>
                <p className="text-sm text-muted-foreground mt-1">{finalScore} / {answers.length} correct</p>
              </div>

              {/* Difficulty breakdown */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Performance by Difficulty</h4>
                {(['easy', 'medium', 'hard'] as const).map(d => {
                  const s = difficultyStats[d];
                  const acc = s.total > 0 ? Math.round((s.correct / s.total) * 100) : null;
                  return (
                    <div key={d} className="flex items-center justify-between text-sm">
                      <Badge className={`text-xs ${DIFF_COLORS[d]}`}>{d}</Badge>
                      <span className="text-muted-foreground">
                        {s.total > 0 ? `${s.correct}/${s.total} · ${acc}%` : 'No questions'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {weakTopics.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Review these topics: <strong>{weakTopics.join(', ')}</strong>
                  </AlertDescription>
                </Alert>
              )}

              {quizResult?.feedback && (
                <div className="rounded-lg bg-muted/50 p-4 text-sm">{quizResult.feedback}</div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => { setQuizState('config'); }} className="flex-1 gap-2">
                  <RotateCcw className="h-4 w-4" /> Try Again
                </Button>
                <Button variant="outline" onClick={() => setQuizState('idle')} className="flex-1">
                  Back to Start
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default AdaptiveQuizSection;
