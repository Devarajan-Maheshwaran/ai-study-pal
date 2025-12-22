import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MCQCardProps {
  question: string;
  options: string[];
  correctIndex?: number;
  onAnswer: (selectedIndex: number) => void;
  userAnswer: number | null;
  isSubmitting?: boolean;
}

export function MCQCard({ 
  question, 
  options, 
  correctIndex, 
  onAnswer, 
  userAnswer,
  isSubmitting = false 
}: MCQCardProps) {
  const hasAnswered = userAnswer !== null;
  
  const getOptionStatus = (index: number) => {
    if (!hasAnswered) return "default";
    if (correctIndex !== undefined) {
      if (index === correctIndex) return "correct";
      if (index === userAnswer && index !== correctIndex) return "incorrect";
    }
    // If we don't know the answer yet but user selected this
    if (index === userAnswer) return "selected";
    return "disabled";
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 mb-6">
      <h3 className="text-xl font-bold font-display text-foreground mb-6">
        {question}
      </h3>

      <div className="space-y-3">
        {options.map((option, idx) => {
          const status = getOptionStatus(idx);
          
          return (
            <button
              key={idx}
              onClick={() => !hasAnswered && !isSubmitting && onAnswer(idx)}
              disabled={hasAnswered || isSubmitting}
              className={cn(
                "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group relative overflow-hidden",
                status === "default" && "border-border hover:border-primary/50 hover:bg-muted/50",
                status === "selected" && "border-primary bg-primary/5",
                status === "correct" && "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300",
                status === "incorrect" && "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300",
                status === "disabled" && "opacity-60 grayscale border-border/50"
              )}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors",
                  status === "default" && "bg-muted border-border text-muted-foreground group-hover:border-primary/50 group-hover:text-primary",
                  status === "selected" && "bg-primary text-white border-primary",
                  status === "correct" && "bg-green-500 text-white border-green-500",
                  status === "incorrect" && "bg-red-500 text-white border-red-500",
                  status === "disabled" && "bg-muted border-border text-muted-foreground"
                )}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="font-medium">{option}</span>
              </div>
              
              <AnimatePresence>
                {status === "correct" && (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="text-green-500"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </motion.div>
                )}
                {status === "incorrect" && (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="text-red-500"
                  >
                    <XCircle className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
      
      {/* Feedback Area */}
      <AnimatePresence>
        {hasAnswered && correctIndex !== undefined && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }}
            className={cn(
              "mt-6 p-4 rounded-xl flex items-start gap-3",
              userAnswer === correctIndex 
                ? "bg-green-500/10 text-green-800 dark:text-green-200" 
                : "bg-red-500/10 text-red-800 dark:text-red-200"
            )}
          >
            {userAnswer === correctIndex ? (
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="font-bold">
                {userAnswer === correctIndex ? "Correct!" : "Incorrect"}
              </p>
              <p className="text-sm opacity-90 mt-1">
                {userAnswer === correctIndex 
                  ? "Great job! You've mastered this concept." 
                  : `The correct answer is Option ${String.fromCharCode(65 + correctIndex)}. Review this topic to strengthen your understanding.`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
