import { useState } from "react";
import { FileText, Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api, getUserId } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MCQ, NotesToMcqsRequest } from "../types/mcq";

type McqWithState = MCQ & {
  selectedIndex: number | null;
  isCorrect: boolean | null;
};

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
      const payload: NotesToMcqsRequest = {
        source_type: "text",
        subject: topic.trim() || "General",
        notes,
        max_questions: maxQuestions,
      };

      const res = await api.notesToMcqs(payload);
      const raw: MCQ[] = res.questions;

      const withState: McqWithState[] = raw.map((q) => ({
        ...q,
        selectedIndex: null,
        isCorrect: null,
      }));
      setMcqs(withState);

      toast({
        title: "MCQs Generated",
        description: `Successfully generated ${withState.length} questions.`,
      });
    } catch (error: unknown) {
      console.error("Failed to generate MCQs:", error);
      const errorMessage = error instanceof Error ? error.message : "Unable to generate MCQs. Please try again.";
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const answerMcq = (id: number, selectedIndex: number) => {
    setMcqs((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const selectedOption = q.options[selectedIndex];
        const isCorrect = selectedOption === q.answer;
        return { ...q, selectedIndex, isCorrect };
      })
    );
  };

  const handleSelectOption = (mcqId: number, index: number) => {
    answerMcq(mcqId, index);
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
                mcq.isCorrect !== null &&
                  (mcq.isCorrect
                    ? "border-green-500 bg-green-50/50"
                    : "border-red-500 bg-red-50/50")
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base font-medium leading-relaxed">
                    <span className="text-muted-foreground mr-2">Q{index + 1}.</span>
                    {mcq.stem}
                  </CardTitle>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="secondary"
                      className={getDifficultyColor(mcq.difficulty || "medium")}
                    >
                      {mcq.difficulty || "medium"}
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
                  disabled={mcq.isCorrect !== null}
                >
                  {mcq.options.map((option, optionIndex) => {
                    const isSelected = mcq.selectedIndex === optionIndex;
                    const isCorrectOption = option === mcq.answer;
                    const showResult = mcq.isCorrect !== null;

                    return (
                      <div
                        key={optionIndex}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                          !showResult && isSelected && "border-primary bg-primary/5",
                          !showResult && !isSelected && "hover:bg-accent/50",
                          showResult && isCorrectOption && "border-green-500 bg-green-100",
                          showResult && isSelected && !isCorrectOption && "border-red-500 bg-red-100"
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
                        {showResult && isCorrectOption && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        {showResult && isSelected && !isCorrectOption && (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>

                {mcq.isCorrect !== null && (
                  <div
                    className={cn(
                      "p-3 rounded-lg text-sm",
                      mcq.isCorrect
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-100"
                    )}
                  >
                    {mcq.isCorrect ? "Correct!" : `Incorrect. The correct answer is: ${mcq.answer}`}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
