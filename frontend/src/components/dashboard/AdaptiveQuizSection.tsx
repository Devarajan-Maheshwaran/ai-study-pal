import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Brain, Play, CheckCircle2, XCircle, RotateCcw, Trophy, Target, ArrowRight, TrendingUp, TrendingDown, Zap, AlertTriangle } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { api, QuizQuestion, QuizResponse, QuizSubmitResponse } from '@/lib/apiClient';
import { generateMotivationalFeedback } from '@/lib/motivationalUtils';
import { useToast } from '@/hooks/use-toast';
import { Question } from '@/types/study';
import { Alert, AlertDescription } from '@/components/ui/alert';

type QuizLength = 10 | 20;
type StartLevel = 'easy' | 'medium';

interface DifficultyStats {
  easy: { total: number; correct: number };
  medium: { total: number; correct: number };
  hard: { total: number; correct: number };
}

const AdaptiveQuizSection = () => {
  const { 
    currentSubjectId, 
    getQuestionsBySubject, 
    getQuizAttemptsBySubject, 
    recordQuizAttempt,
    getCurrentSubject 
  } = useAppState();
  
  const [quizState, setQuizState] = useState<'idle' | 'config' | 'active' | 'complete'>('idle');
  const [quizLength, setQuizLength] = useState<QuizLength>(10);
  const [startLevel, setStartLevel] = useState<StartLevel>('easy');
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [quizResult, setQuizResult] = useState<QuizSubmitResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [difficultyStats, setDifficultyStats] = useState<DifficultyStats>({
    easy: { total: 0, correct: 0 },
    medium: { total: 0, correct: 0 },
    hard: { total: 0, correct: 0 },
  });
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const { toast } = useToast();

  const currentSubject = getCurrentSubject();
  const allQuestions = currentSubjectId ? getQuestionsBySubject(currentSubjectId) : [];
  const previousAttempts = currentSubjectId ? getQuizAttemptsBySubject(currentSubjectId) : [];
  
  const lastAccuracy = previousAttempts.length > 0 
    ? previousAttempts[previousAttempts.length - 1].accuracy 
    : 50;

  const openConfig = () => {
    if (allQuestions.length === 0) {
      toast({ 
        title: 'No questions available', 
        description: 'Generate MCQs from your study material first', 
        variant: 'destructive' 
      });
      return;
    }
    setQuizState('config');
  };

  const startQuiz = () => {
    // Convert to GeneratedQuestion format for adaptive selection
    const generatedFormat: GeneratedQuestion[] = allQuestions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      topic: q.topic,
    }));

    // Adjust initial accuracy based on start level
    const initialAccuracy = startLevel === 'easy' ? 30 : 60;
    const selected = selectAdaptiveQuestions(generatedFormat, initialAccuracy, Math.min(quizLength, allQuestions.length));
    
    // Map back to Question format
    const quizQuestions: Question[] = selected.map((q, idx) => ({
      id: `quiz-${idx}`,
      subjectId: currentSubjectId || '',
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      topic: q.topic,
    }));

    setCurrentQuestions(quizQuestions);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setCurrentDifficulty(startLevel);
    setDifficultyStats({
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      hard: { total: 0, correct: 0 },
    });
    setWeakTopics([]);
    setQuizState('active');
  };

  const handleAnswer = (answerIdx: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIdx);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowFeedback(true);
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    const currentQuestion = currentQuestions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    // Update difficulty stats
    setDifficultyStats(prev => ({
      ...prev,
      [currentQuestion.difficulty]: {
        total: prev[currentQuestion.difficulty].total + 1,
        correct: prev[currentQuestion.difficulty].correct + (isCorrect ? 1 : 0),
      }
    }));

    // Track weak topics
    if (!isCorrect && currentQuestion.topic) {
      setWeakTopics(prev => 
        prev.includes(currentQuestion.topic!) ? prev : [...prev, currentQuestion.topic!]
      );
    }

    // Adaptive difficulty adjustment
    if (isCorrect) {
      // Correct: increase difficulty
      if (currentDifficulty === 'easy') setCurrentDifficulty('medium');
      else if (currentDifficulty === 'medium') setCurrentDifficulty('hard');
    } else {
      // Incorrect: decrease or maintain
      if (currentDifficulty === 'hard') setCurrentDifficulty('medium');
      else if (currentDifficulty === 'medium') setCurrentDifficulty('easy');
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      if (currentIndex < currentQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setQuizState('complete');
      }
    }, 1200);
  };

  const handleSubmit = async () => {
    setQuizState('complete');
    try {
      const response = await api.submitQuiz({
        subject: currentSubject?.name || 'General',
        user_id: currentSubjectId || 'user',
        answers: answers.map((ans, idx) => ({ question_id: currentQuestions[idx].id, answer: ans }))
      });
      setQuizResult(response);
    } catch (e) {
      toast({ title: 'Error', description: (e as Error).message || 'Failed to submit quiz', variant: 'destructive' });
    }
  };

  const getFeedbackMessage = (isCorrect: boolean, question: Question) => {
    if (isCorrect) {
      return {
        message: "Correct! Great understanding.",
        suggestion: `Next question will be ${currentDifficulty === 'hard' ? 'at the same level' : 'slightly harder'} based on your performance.`
      };
    }
    return {
      message: `Not quite. The correct answer was: ${question.options[question.correctAnswer]}`,
      suggestion: question.topic 
        ? `Revisit topic: ${question.topic}. Next question will be ${currentDifficulty === 'easy' ? 'at the same level' : 'slightly easier'}.`
        : `Next question will be ${currentDifficulty === 'easy' ? 'at the same level' : 'slightly easier'} based on your performance.`
    };
  };

  return (
    <Card className="border-2 border-border bg-card shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Adaptive Quiz
        </CardTitle>
        <CardDescription>
          Take an adaptive quiz that adjusts difficulty based on your performance.
          {currentSubject && <span className="ml-1 text-primary">Subject: {currentSubject.name}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Idle State */}
        {quizState === 'idle' && (
          <div className="text-center py-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-semibold mb-2">Ready to Test Your Knowledge?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {allQuestions.length > 0 
                ? `You have ${allQuestions.length} questions available. The quiz adapts to your skill level in real-time.`
                : 'Generate MCQs from your study material first to start a quiz.'
              }
            </p>
            {previousAttempts.length > 0 && (
              <div className="mb-6 p-4 rounded-lg bg-secondary/50 inline-block">
                <p className="text-sm text-muted-foreground">
                  Last attempt accuracy: <span className="font-semibold text-primary">{lastAccuracy}%</span>
                  <span className="mx-2">•</span>
                  Total attempts: <span className="font-semibold">{previousAttempts.length}</span>
                </p>
              </div>
            )}
            <Button 
              onClick={openConfig} 
              disabled={allQuestions.length === 0}
              size="lg"
              className="gradient-hero text-primary-foreground"
            >
              <Play className="mr-2 h-5 w-5" />
              Configure Quiz
            </Button>
          </div>
        )}

        {/* Config State */}
        {quizState === 'config' && (
          <div className="space-y-6 animate-fade-in max-w-md mx-auto">
            <div className="text-center mb-6">
              <h3 className="font-heading text-lg font-semibold">Quiz Configuration</h3>
              <p className="text-sm text-muted-foreground">Customize your quiz experience</p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-secondary/20 p-4">
                <Label className="text-base font-medium mb-3 block">Quiz Length</Label>
                <RadioGroup 
                  value={quizLength.toString()} 
                  onValueChange={(v) => setQuizLength(parseInt(v) as QuizLength)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="10" id="len-10" />
                    <Label htmlFor="len-10">10 questions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="20" id="len-20" />
                    <Label htmlFor="len-20">20 questions</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="rounded-xl border border-border bg-secondary/20 p-4">
                <Label className="text-base font-medium mb-3 block">Starting Difficulty</Label>
                <RadioGroup 
                  value={startLevel} 
                  onValueChange={(v) => setStartLevel(v as StartLevel)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easy" id="level-easy" />
                    <Label htmlFor="level-easy">Easy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="level-medium" />
                    <Label htmlFor="level-medium">Medium</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={() => setQuizState('idle')}>
                Cancel
              </Button>
              <Button onClick={startQuiz} className="gradient-hero text-primary-foreground">
                <Zap className="mr-2 h-4 w-4" />
                Start Quiz
              </Button>
            </div>
          </div>
        )}

        {/* Active Quiz */}
        {quizState === 'active' && currentQuestion && (
          <div className="space-y-6 animate-fade-in">
            {/* Progress Header */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Question {currentIndex + 1} of {currentQuestions.length}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${
                  currentDifficulty === 'easy' ? 'border-success text-success' :
                  currentDifficulty === 'medium' ? 'border-warning text-warning' :
                  'border-destructive text-destructive'
                }`}>
                  Current: {currentDifficulty}
                </Badge>
                <Badge variant="secondary" className="font-normal">
                  {currentQuestion.difficulty}
                </Badge>
              </div>
            </div>

            <Progress value={progress} className="h-2" />

            {/* Question Card */}
            <div className="p-6 rounded-xl bg-secondary/30 border border-border">
              {currentQuestion.topic && (
                <Badge variant="outline" className="mb-3 text-xs">
                  Topic: {currentQuestion.topic}
                </Badge>
              )}
              <p className="font-medium text-lg text-foreground">{currentQuestion.question}</p>
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === currentQuestion.correctAnswer;
                const showCorrect = showFeedback && isCorrect;
                const showWrong = showFeedback && isSelected && !isCorrect;

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={showFeedback}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      showCorrect
                        ? 'bg-success/10 border-success'
                        : showWrong
                        ? 'bg-destructive/10 border-destructive'
                        : isSelected
                        ? 'bg-primary/10 border-primary'
                        : 'bg-background border-border hover:border-primary/50'
                    }`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                      showCorrect
                        ? 'bg-success text-success-foreground'
                        : showWrong
                        ? 'bg-destructive text-destructive-foreground'
                        : isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 font-medium">{option}</span>
                    {showCorrect && <CheckCircle2 className="h-5 w-5 text-success" />}
                    {showWrong && <XCircle className="h-5 w-5 text-destructive" />}
                  </button>
                );
              })}
            </div>

            {/* Inline Feedback */}
            {showFeedback && (
              <Alert className={`animate-fade-in ${
                selectedAnswer === currentQuestion.correctAnswer 
                  ? 'border-success bg-success/5' 
                  : 'border-destructive bg-destructive/5'
              }`}>
                <div className="flex items-start gap-2">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                  )}
                  <div>
                    <AlertDescription className="font-medium">
                      {getFeedbackMessage(selectedAnswer === currentQuestion.correctAnswer, currentQuestion).message}
                    </AlertDescription>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      {selectedAnswer === currentQuestion.correctAnswer ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {getFeedbackMessage(selectedAnswer === currentQuestion.correctAnswer, currentQuestion).suggestion}
                    </p>
                  </div>
                </div>
              </Alert>
            )}

            {!showFeedback && (
              <Button 
                onClick={submitAnswer} 
                disabled={selectedAnswer === null}
                className="w-full"
              >
                Submit & Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Complete State */}
        {quizState === 'complete' && (
          <div className="py-8 animate-fade-in">
            <div className="text-center">
              <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl ${
                finalAccuracy >= 80 ? 'bg-success/20' : finalAccuracy >= 50 ? 'bg-warning/20' : 'bg-destructive/20'
              }`}>
                <Trophy className={`h-10 w-10 ${
                  finalAccuracy >= 80 ? 'text-success' : finalAccuracy >= 50 ? 'text-warning' : 'text-destructive'
                }`} />
              </div>
              
              <h3 className="font-heading text-2xl font-bold mb-2">Quiz Complete!</h3>
              
              {/* Score Summary */}
              <div className="flex items-center justify-center gap-8 my-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{finalScore}/{currentQuestions.length}</p>
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${
                    finalAccuracy >= 80 ? 'text-success' : finalAccuracy >= 50 ? 'text-warning' : 'text-destructive'
                  }`}>{finalAccuracy}%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="rounded-xl border border-border bg-secondary/20 p-4 mb-4">
              <h4 className="font-semibold text-sm mb-3">Performance by Difficulty</h4>
              <div className="grid grid-cols-3 gap-3">
                {(['easy', 'medium', 'hard'] as const).map((diff) => {
                  const stats = difficultyStats[diff];
                  const acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                  return (
                    <div key={diff} className="text-center p-2 rounded-lg bg-background">
                      <Badge variant="outline" className={`mb-2 ${
                        diff === 'easy' ? 'border-success text-success' :
                        diff === 'medium' ? 'border-warning text-warning' :
                        'border-destructive text-destructive'
                      }`}>
                        {diff}
                      </Badge>
                      <p className="text-lg font-bold">{stats.correct}/{stats.total}</p>
                      <p className="text-xs text-muted-foreground">{acc}% accuracy</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weak Topics */}
            {weakTopics.length > 0 && (
              <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Suggested Next Actions</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Do a quick summary revision on: <span className="font-medium text-foreground">{weakTopics.join(', ')}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Motivational Feedback */}
            <div className="p-4 rounded-xl bg-secondary/50 mb-6 text-center">
              <p className="text-foreground">
                {(() => {
                  const feedback = generateMotivationalFeedback(currentSubject?.name || 'General', finalScore, currentQuestions.length);
                  return `${feedback.emoji} ${feedback.mainMessage}`;
                })()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Button onClick={() => setQuizState('config')} className="gradient-hero text-primary-foreground">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={resetQuiz}>
                <Target className="mr-2 h-4 w-4" />
                Back to Overview
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdaptiveQuizSection;
