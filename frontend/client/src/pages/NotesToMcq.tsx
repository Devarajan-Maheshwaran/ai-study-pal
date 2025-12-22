import { useState } from "react";
import { PageContainer } from "@/components/PageContainer";
import { useGenerateMcqs, useAnswerMcq, useUserId } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MCQCard } from "@/components/MCQCard";
import { Wand2, RefreshCcw, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function NotesToMcq() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  
  const generate = useGenerateMcqs();
  const answer = useAnswerMcq();
  const userId = useUserId();

  const handleGenerate = async () => {
    if (!topic) return;
    setMcqs([]);
    setUserAnswers({});
    
    const result = await generate.mutateAsync({
      topic,
      text: notes,
      maxQuestions: 5
    });
    setMcqs(result);
  };

  const handleAnswer = async (questionIndex: number, selectedOptionIndex: number) => {
    // Optimistic update
    setUserAnswers(prev => ({ ...prev, [questionIndex]: selectedOptionIndex }));

    // In a real app, we'd send this to the server
    await answer.mutateAsync({
      userId,
      topic,
      chosenIndex: selectedOptionIndex,
      isCorrect: selectedOptionIndex === mcqs[questionIndex].correctIndex,
      mcq: mcqs[questionIndex]
    });
  };

  return (
    <PageContainer 
      title="Notes to Quiz" 
      description="Paste your study notes or choose a topic, and AI will generate a practice quiz for you."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <Card className="p-6 border-border shadow-md">
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic / Subject</Label>
                <Input 
                  id="topic" 
                  placeholder="e.g. Photosynthesis, World War II, Linear Algebra" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Paste Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Paste your lecture notes or text summary here..." 
                  className="h-48 mt-1.5 resize-none font-mono text-sm"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={!topic || generate.isPending}
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
              >
                {generate.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </div>
          </Card>
          
          <div className="bg-accent/10 border border-accent/20 p-6 rounded-2xl">
            <h3 className="font-bold text-accent-foreground mb-2 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5" />
              AI Magic
            </h3>
            <p className="text-sm text-muted-foreground">
              Our AI analyzes your text to identify key concepts and creates challenging questions to test your understanding, not just memorization.
            </p>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {mcqs.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-display">Generated Quiz</h2>
                <Button variant="ghost" size="sm" onClick={() => { setMcqs([]); setTopic(""); setNotes(""); }}>
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>

              {mcqs.map((mcq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <MCQCard
                    question={mcq.question}
                    options={mcq.options}
                    correctIndex={mcq.correctIndex}
                    userAnswer={userAnswers[idx] ?? null}
                    onAnswer={(optIdx) => handleAnswer(idx, optIdx)}
                  />
                </motion.div>
              ))}

              <div className="flex justify-end pt-4">
                <Button variant="outline" className="gap-2">
                  <Save className="w-4 h-4" /> Save Quiz to Library
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-3xl bg-muted/30 text-center min-h-[400px]">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <Wand2 className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Ready to Create</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Enter a topic or paste your notes on the left to instantly generate a custom quiz.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M9 17v4" />
      <path d="M3 7h4" />
      <path d="M17 21h4" />
    </svg>
  );
}
