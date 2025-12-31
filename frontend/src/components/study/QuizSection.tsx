import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy } from "lucide-react";

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium";
}

interface QuizSectionProps {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
}

const QuizSection = ({ questions, onComplete }: QuizSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = () => {
    const isCorrect = parseInt(selectedAnswer) === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer("");
      setShowResult(false);
    } else {
      setIsComplete(true);
      onComplete(score + (parseInt(selectedAnswer) === currentQuestion.correctAnswer ? 1 : 0), questions.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer("");
    setShowResult(false);
    setScore(0);
    setIsComplete(false);
  };

  if (isComplete) {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);
    
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center animate-slide-up">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full gradient-hero shadow-glow">
          <Trophy className="h-10 w-10 text-primary-foreground" />
        </div>
        <h3 className="mb-2 font-heading text-2xl font-bold text-foreground">
          Quiz Complete!
        </h3>
        <p className="mb-1 text-lg text-muted-foreground">
          You scored <span className="font-bold text-primary">{finalScore}</span> out of{" "}
          <span className="font-bold">{questions.length}</span>
        </p>
        <p className="mb-6 text-3xl font-bold text-gradient">{percentage}%</p>
        <Button variant="outline" onClick={handleRestart}>
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            currentQuestion.difficulty === "easy"
              ? "bg-success/10 text-success"
              : "bg-warning/10 text-warning"
          }`}
        >
          {currentQuestion.difficulty}
        </span>
      </div>

      <div className="w-full rounded-full bg-secondary h-2">
        <div
          className="h-2 rounded-full gradient-hero transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <h3 className="font-heading text-lg font-semibold text-foreground">
        {currentQuestion.question}
      </h3>

      <RadioGroup
        value={selectedAnswer}
        onValueChange={setSelectedAnswer}
        disabled={showResult}
        className="space-y-3"
      >
        {currentQuestion.options.map((option, index) => {
          const isSelected = parseInt(selectedAnswer) === index;
          const isCorrect = index === currentQuestion.correctAnswer;
          
          let optionStyles = "border-2 border-border bg-card hover:border-primary/50";
          if (showResult) {
            if (isCorrect) {
              optionStyles = "border-2 border-success bg-success/10";
            } else if (isSelected && !isCorrect) {
              optionStyles = "border-2 border-destructive bg-destructive/10";
            }
          }

          return (
            <div key={index} className="flex items-center">
              <Label
                htmlFor={`option-${index}`}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl p-4 transition-all ${optionStyles}`}
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <span className="flex-1 text-foreground">{option}</span>
                {showResult && isCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      <div className="flex gap-3">
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            variant="hero"
            className="flex-1"
          >
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNext} variant="hero" className="flex-1">
            {currentIndex < questions.length - 1 ? (
              <>
                Next Question
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              "See Results"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizSection;
