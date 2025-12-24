import { useState } from "react";
import { FileText, Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { generateMcqs, answerMcq, getUserId, MCQ, AnswerMcqFeedback } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface McqWithState extends MCQ {
  selectedIndex: number | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  feedback: AnswerMcqFeedback | null;
}

export default function NotesToMcqsPage() {
  const [notes, setNotes] = useState("");
  const [topic, setTopic] = useState("");
  const [maxQuestions, setMaxQuestions] = useState(5);
  const [mcqs, setMcqs] = useState<McqWithState[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateMcqs = async () => {
    if (!notes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please enter some notes to generate MCQs from.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await generateMcqs({
        text: notes,
        topic: topic.trim() || null,
        max_questions: maxQuestions,
      });

      setMcqs(
        response.mcqs.map((mcq) => ({
          ...mcq,
          selectedIndex: null,
          isSubmitted: false,
          isCorrect: null,
          feedback: null,
        }))
      );

      toast({
        title: "MCQs Generated",
        description: `Successfully generated ${response.mcqs.length} questions.`,
      });
    } catch (error) {
      console.error("Failed to generate MCQs:", error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate MCQs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (mcqId: string, index: number) => {
    setMcqs((prev) =>
      prev.map((mcq) =>
        mcq.id === mcqId && !mcq.isSubmitted
          ? { ...mcq, selectedIndex: index }
          : mcq
      )
    );
  };

  const handleSubmitAnswer = async (mcqId: string) => {
    const mcq = mcqs.find((m) => m.id === mcqId);
    if (!mcq || mcq.selectedIndex === null) return;

    setSubmittingId(mcqId);
    try {
      const response = await answerMcq({
        user_id: getUserId(),
        mcq: {
          id: mcq.id,
          question: mcq.question,
          options: mcq.options,
          correct_index: mcq.correct_index,
          topic: mcq.topic,
          difficulty: mcq.difficulty,
        },
        chosen_index: mcq.selectedIndex,
      });

      setMcqs((prev) =>
        prev.map((m) =>
          m.id === mcqId
            ? {
                ...m,
                isSubmitted: true,
                isCorrect: response.feedback.is_correct,
                feedback: response.feedback,
              }
            : m
        )
      );
    } catch (error) {
      console.error("Failed to submit answer:", error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingId(null);
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

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notes to MCQs</h1>
        <p className="text-muted-foreground mt-1">
          Transform your study notes into interactive quiz questions
        </p>
      </div>

      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Study Notes
          </CardTitle>
          <CardDescription>
            Paste your notes below and we'll generate MCQs to test your understanding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Paste your study notes here... The more content you provide, the better the questions will be."
              className="min-h-[200px] resize-y"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic / Subject (Optional)</Label>
              <Input
                id="topic"
                placeholder="e.g., Biology, History, Math..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxQuestions">Max Questions</Label>
              <Input
                id="maxQuestions"
                type="number"
                min={1}
                max={20}
                value={maxQuestions}
                onChange={(e) => setMaxQuestions(parseInt(e.target.value) || 5)}
              />
            </div>
          </div>

          <Button
            className="w-full sm:w-auto"
            onClick={handleGenerateMcqs}
            disabled={loading || !notes.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate MCQs
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* MCQs List */}
      {mcqs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Generated Questions ({mcqs.length})
          </h2>

          {mcqs.map((mcq, index) => (
            <Card
              key={mcq.id}
              className={cn(
                "transition-all",
                mcq.isSubmitted &&
                  (mcq.isCorrect
                    ? "border-green-500 bg-green-50/50"
                    : "border-red-500 bg-red-50/50")
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base font-medium leading-relaxed">
                    <span className="text-muted-foreground mr-2">Q{index + 1}.</span>
                    {mcq.question}
                  </CardTitle>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="secondary"
                      className={getDifficultyColor(mcq.difficulty)}
                    >
                      {mcq.difficulty}
                    </Badge>
                    {mcq.topic && (
                      <Badge variant="outline">{mcq.topic}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={mcq.selectedIndex?.toString() ?? ""}
                  onValueChange={(val) => handleSelectOption(mcq.id, parseInt(val))}
                  disabled={mcq.isSubmitted}
                >
                  {mcq.options.map((option, optionIndex) => {
                    const isSelected = mcq.selectedIndex === optionIndex;
                    const isCorrect = mcq.correct_index === optionIndex;
                    const showResult = mcq.isSubmitted;

                    return (
                      <div
                        key={optionIndex}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                          !showResult && isSelected && "border-primary bg-primary/5",
                          !showResult && !isSelected && "hover:bg-accent/50",
                          showResult && isCorrect && "border-green-500 bg-green-100",
                          showResult && isSelected && !isCorrect && "border-red-500 bg-red-100"
                        )}
                      >
                        <RadioGroupItem
                          value={optionIndex.toString()}
                          id={`${mcq.id}-${optionIndex}`}
                        />
                        <Label
                          htmlFor={`${mcq.id}-${optionIndex}`}
                          className="flex-1 cursor-pointer font-normal"
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

                {mcq.isSubmitted && mcq.feedback && (
                  <div
                    className={cn(
                      "p-3 rounded-lg text-sm",
                      mcq.isCorrect
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    )}
                  >
                    {mcq.feedback.message}
                  </div>
                )}

                {!mcq.isSubmitted && (
                  <Button
                    variant="secondary"
                    onClick={() => handleSubmitAnswer(mcq.id)}
                    disabled={mcq.selectedIndex === null || submittingId === mcq.id}
                  >
                    {submittingId === mcq.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Answer"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
