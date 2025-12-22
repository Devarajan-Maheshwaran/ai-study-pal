import { useState, useEffect } from "react";
import { PageContainer } from "@/components/PageContainer";
import { useLearningPath, useGenerateMcqs } from "@/hooks/use-api";
import { MCQCard } from "@/components/MCQCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowRight, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdaptiveQuiz() {
  const { data: learningPath } = useLearningPath();
  const generate = useGenerateMcqs();
  
  const [stage, setStage] = useState<'intro' | 'quiz' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  
  // Recommend topic from learning path or fallback
  const recommendedTopic = learningPath?.nextSteps?.find(s => s.type === 'quiz')?.topic || "General Knowledge";

  const startQuiz = async () => {
    setStage('quiz');
    const questions = await generate.mutateAsync({
      topic: recommendedTopic,
      maxQuestions: 5
    });
    setMcqs(questions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers({});
  };

  const handleAnswer = (optionIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
    if (optionIndex === mcqs[currentQuestionIndex].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < mcqs.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setStage('results');
    }
  };

  if (stage === 'intro') {
    return (
      <PageContainer title="Adaptive Quiz" description="Personalized questions to test your knowledge level.">
        <div className="max-w-2xl mx-auto mt-10 text-center">
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Trophy className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-3xl font-bold font-display mb-4">Ready to test your skills?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Based on your learning history, we recommend a quiz on <span className="text-foreground font-bold">{recommendedTopic}</span>.
            This short 5-question quiz will adapt to your performance.
          </p>
          <Button size="lg" onClick={startQuiz} className="px-8 text-lg h-14 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
            Start Quiz <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (stage === 'quiz' && mcqs.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h3 className="text-xl font-bold">Generating personalized questions...</h3>
        <p className="text-muted-foreground">Analyzing topic difficulty: {recommendedTopic}</p>
      </div>
    );
  }

  if (stage === 'results') {
    const percentage = Math.round((score / mcqs.length) * 100);
    return (
      <PageContainer title="Quiz Results">
        <div className="max-w-2xl mx-auto mt-10 text-center bg-card p-10 rounded-3xl border border-border shadow-lg">
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-4xl font-display font-bold mb-2">{percentage}%</h2>
          <p className="text-xl text-muted-foreground mb-8">
            You got {score} out of {mcqs.length} correct
          </p>
          
          <div className="bg-muted p-6 rounded-2xl mb-8 text-left">
            <h4 className="font-bold mb-2">AI Feedback</h4>
            <p className="text-sm text-muted-foreground">
              {percentage >= 80 
                ? "Excellent work! You have a strong grasp of this topic. We'll increase the difficulty for next time."
                : "Good effort. Review the questions you missed and try reading the suggested resources before attempting again."}
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => setStage('intro')}>Back to Menu</Button>
            <Button onClick={startQuiz}>Try Another Quiz</Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const currentQ = mcqs[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mcqs.length) * 100;

  return (
    <PageContainer title={recommendedTopic}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-sm font-medium text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {mcqs.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <MCQCard
              question={currentQ.question}
              options={currentQ.options}
              correctIndex={currentQ.correctIndex}
              userAnswer={userAnswers[currentQuestionIndex] ?? null}
              onAnswer={handleAnswer}
            />
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-end mt-6">
          <Button 
            size="lg" 
            onClick={nextQuestion}
            disabled={userAnswers[currentQuestionIndex] === undefined}
            className="px-8"
          >
            {currentQuestionIndex === mcqs.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
