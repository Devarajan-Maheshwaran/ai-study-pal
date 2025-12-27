import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Brain,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
  Trophy,
  Target,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { api, getUserId } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface QuizState {
  mcqs: MCQ[];
  currentIndex: number;
  selectedAnswer: number | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  feedbackMessage: string;
  score: number;
  isComplete: boolean;
}

export default function AdaptiveQuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizStep, setQuizStep] = useState<NextStep | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPathResponse | null>(null);
  const [quiz, setQuiz] = useState<QuizState>({
    mcqs: [],
    currentIndex: 0,
    selectedAnswer: null,
    isSubmitted: false,
    isCorrect: null,
    feedbackMessage: "",
    score: 0,
    isComplete: false,
  });

  useEffect(() => {
    initializeQuiz();
  }, []);

  const initializeQuiz = async () => {
    setLoading(true);
    try {
      // Check for state passed from dashboard
      const passedStep = location.state as NextStep | null;

      if (passedStep && passedStep.type === "quiz") {
        setQuizStep(passedStep);
        await loadQuizQuestions(passedStep);
      } else {
        // Fetch learning path to get quiz recommendation
        const pathData = await getLearningPath(getUserId());
        setLearningPath(pathData);

        const step = pathData.next_steps.find((s) => s.type === "quiz");
        if (step) {
          setQuizStep(step);
          await loadQuizQuestions(step);
        }
      }
    } catch (error) {
      console.error("Failed to initialize quiz:", error);
      toast({
        title: "Error",
        description: "Failed to load quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadQuizQuestions = async (step: NextStep) => {
    const response = await generateMcqs({
      text: `Generate quiz questions about ${step.topic}`,
      topic: step.topic,
      max_questions: step.count || 5,
    });

    setQuiz({
      mcqs: response.mcqs,
      currentIndex: 0,
      selectedAnswer: null,
      isSubmitted: false,
      isCorrect: null,
      feedbackMessage: "",
      score: 0,
      isComplete: false,
    });
  };

  const handleSelectAnswer = (index: number) => {
    if (!quiz.isSubmitted) {
      setQuiz((prev) => ({ ...prev, selectedAnswer: index }));
    }
  };

  const handleSubmitAnswer = async () => {
    if (quiz.selectedAnswer === null) return;

    const currentMcq = quiz.mcqs[quiz.currentIndex];
    setSubmitting(true);

    try {
      const body = {
        user_id: getUserId(),
        subject: currentMcq.topic,
        answers: [{ question_id: currentMcq.id, correct: quiz.selectedAnswer === currentMcq.correct_index }],
      };
      const response = await api.submitQuiz(body);

      setQuiz((prev) => ({
        ...prev,
        isSubmitted: true,
        isCorrect: quiz.selectedAnswer === currentMcq.correct_index,
        feedbackMessage: response.feedback,
        score: prev.score + (quiz.selectedAnswer === currentMcq.correct_index ? 1 : 0),
      }));
    } catch (error) {
      console.error("Failed to submit answer:", error);
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = quiz.currentIndex + 1;

    if (nextIndex >= quiz.mcqs.length) {
      setQuiz((prev) => ({ ...prev, isComplete: true }));
    } else {
      setQuiz((prev) => ({
        ...prev,
        currentIndex: nextIndex,
        selectedAnswer: null,
        isSubmitted: false,
        isCorrect: null,
        feedbackMessage: "",
      }));
    }
  };

  const handleRefreshPath = async () => {
    setLoading(true);
    try {
      const pathData = await getLearningPath(getUserId());
      setLearningPath(pathData);
      toast({
        title: "Learning Path Updated",
        description: "Your progress has been synced.",
      });
    } catch (error) {
      console.error("Failed to refresh learning path:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestartQuiz = () => {
    if (quizStep) {
      loadQuizQuestions(quizStep);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizStep || quiz.mcqs.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              No Quiz Available
            </CardTitle>
            <CardDescription>
              You don't have any quiz recommendations yet. Start by creating some
              MCQs from your notes!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/notes-to-mcqs")}>
              Create MCQs from Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quiz.isComplete) {
    const percentage = Math.round((quiz.score / quiz.mcqs.length) * 100);

    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
            <CardDescription>
              You've finished the {quizStep.topic} quiz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="text-4xl font-bold">
                {quiz.score}/{quiz.mcqs.length}
              </div>
              <p className="text-muted-foreground">
                {percentage}% Accuracy
              </p>
              <Progress value={percentage} className="h-3 max-w-xs mx-auto" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={handleRestartQuiz}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Quiz
              </Button>
              <Button onClick={handleRefreshPath}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Learning Path
              </Button>
            </div>

            {learningPath && Object.keys(learningPath.topic_stats).length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Updated Stats</h3>
                <div className="grid gap-2 max-w-md mx-auto">
                  {Object.entries(learningPath.topic_stats)
                    .slice(0, 3)
                    .map(([topic, stats]) => (
                      <div
                        key={topic}
                        className="flex items-center justify-between p-2 bg-accent/50 rounded-lg"
                      >
                        <span className="text-sm font-medium">{topic}</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(stats.accuracy)}% accuracy
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentMcq = quiz.mcqs[quiz.currentIndex];
  const progress = ((quiz.currentIndex + 1) / quiz.mcqs.length) * 100;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Adaptive Quiz</h1>
        <p className="text-muted-foreground mt-1">
          Testing your knowledge on {quizStep.topic}
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Question {quiz.currentIndex + 1} of {quiz.mcqs.length}
            </span>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Score: {quiz.score}/{quiz.currentIndex + (quiz.isSubmitted ? 1 : 0)}
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card
        className={cn(
          "transition-all",
          quiz.isSubmitted &&
            (quiz.isCorrect
              ? "border-green-500"
              : "border-red-500")
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg font-medium leading-relaxed">
              {currentMcq.question}
            </CardTitle>
            <Badge
              variant="secondary"
              className={getDifficultyColor(currentMcq.difficulty)}
            >
              {currentMcq.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={quiz.selectedAnswer?.toString() ?? ""}
            onValueChange={(val) => handleSelectAnswer(parseInt(val))}
            disabled={quiz.isSubmitted}
          >
            {currentMcq.options.map((option, index) => {
              const isSelected = quiz.selectedAnswer === index;
              const isCorrect = currentMcq.correct_index === index;
              const showResult = quiz.isSubmitted;

              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer",
                    !showResult && isSelected && "border-primary bg-primary/5",
                    !showResult && !isSelected && "hover:bg-accent/50",
                    showResult && isCorrect && "border-green-500 bg-green-100",
                    showResult && isSelected && !isCorrect && "border-red-500 bg-red-100"
                  )}
                  onClick={() => handleSelectAnswer(index)}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer font-normal text-base"
                  >
                    {option}
                  </Label>
                  {showResult && isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              );
            })}
          </RadioGroup>

          {quiz.isSubmitted && quiz.feedbackMessage && (
            <div
              className={cn(
                "p-4 rounded-lg",
                quiz.isCorrect
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              )}
            >
              {quiz.feedbackMessage}
            </div>
          )}

          <div className="flex justify-end pt-2">
            {!quiz.isSubmitted ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={quiz.selectedAnswer === null || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Answer"
                )}
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                {quiz.currentIndex + 1 >= quiz.mcqs.length ? (
                  "View Results"
                ) : (
                  <>
                    Next Question
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
