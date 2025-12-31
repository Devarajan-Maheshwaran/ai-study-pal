import { useEffect, useState } from "react";
import { Sparkles, Heart, Star, Zap, Target, Flame } from "lucide-react";

interface MotivationalFeedbackProps {
  subject?: string;
  quizScore?: number;
  totalQuestions?: number;
}

const motivationalMessages = [
  { icon: Star, message: "You're doing amazing! Keep up the great work!", color: "text-warning" },
  { icon: Heart, message: "Every step forward counts. You've got this!", color: "text-accent" },
  { icon: Zap, message: "Your dedication is inspiring. Stay focused!", color: "text-primary" },
  { icon: Target, message: "Great progress! You're getting closer to your goals!", color: "text-success" },
  { icon: Flame, message: "You're on fire! Keep that momentum going!", color: "text-accent" },
  { icon: Sparkles, message: "Brilliant effort! Your hard work will pay off!", color: "text-primary" },
];

const getScoreMessage = (score: number, total: number) => {
  const percentage = (score / total) * 100;
  if (percentage === 100) return "Perfect score! You're absolutely crushing it! 🎉";
  if (percentage >= 80) return "Excellent work! You really know your stuff! 🌟";
  if (percentage >= 60) return "Good job! You're making solid progress! 💪";
  if (percentage >= 40) return "Nice try! Keep practicing and you'll improve! 📚";
  return "Don't give up! Every attempt is a learning opportunity! 🚀";
};

const MotivationalFeedback = ({ subject, quizScore, totalQuestions }: MotivationalFeedbackProps) => {
  const [currentMessage, setCurrentMessage] = useState(motivationalMessages[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    setCurrentMessage(motivationalMessages[randomIndex]);
  }, [subject, quizScore]);

  const Icon = currentMessage.icon;

  return (
    <div className="rounded-2xl gradient-warm p-6 text-accent-foreground shadow-soft animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card/20 backdrop-blur-sm">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 font-heading text-lg font-bold">
            {quizScore !== undefined && totalQuestions
              ? "Quiz Feedback"
              : "Daily Motivation"}
          </h3>
          <p className="text-sm opacity-90">
            {quizScore !== undefined && totalQuestions
              ? getScoreMessage(quizScore, totalQuestions)
              : currentMessage.message}
          </p>
          {subject && (
            <p className="mt-2 text-xs opacity-75">
              Keep going with your {subject} studies!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MotivationalFeedback;
