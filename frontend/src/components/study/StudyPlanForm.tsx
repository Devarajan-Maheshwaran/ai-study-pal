import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, BookOpen, Sparkles } from "lucide-react";

interface StudyPlanFormProps {
  onGenerate: (data: {
    subject: string;
    hours: number;
    scenario: string;
  }) => void;
  isLoading?: boolean;
}

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Literature",
  "Economics",
  "Psychology",
  "Languages",
];

const scenarios = [
  { value: "exam", label: "Exam Preparation" },
  { value: "homework", label: "Homework Help" },
  { value: "revision", label: "Topic Revision" },
  { value: "project", label: "Project Work" },
];

const StudyPlanForm = ({ onGenerate, isLoading }: StudyPlanFormProps) => {
  const [subject, setSubject] = useState("");
  const [hours, setHours] = useState<number>(2);
  const [scenario, setScenario] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && hours && scenario) {
      onGenerate({ subject, hours, scenario });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="subject" className="flex items-center gap-2 text-foreground">
            <BookOpen className="h-4 w-4 text-primary" />
            Subject
          </Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger id="subject" className="h-12 rounded-xl border-2 border-border bg-card">
              <SelectValue placeholder="Choose a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s} value={s.toLowerCase()}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hours" className="flex items-center gap-2 text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            Study Hours
          </Label>
          <Input
            id="hours"
            type="number"
            min={1}
            max={12}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="h-12 rounded-xl border-2 border-border bg-card text-foreground"
            placeholder="Hours per day"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="scenario" className="flex items-center gap-2 text-foreground">
          <Calendar className="h-4 w-4 text-primary" />
          Study Scenario
        </Label>
        <Select value={scenario} onValueChange={setScenario}>
          <SelectTrigger id="scenario" className="h-12 rounded-xl border-2 border-border bg-card">
            <SelectValue placeholder="What are you studying for?" />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        variant="hero"
        size="lg"
        className="w-full"
        disabled={!subject || !scenario || isLoading}
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Study Plan
          </>
        )}
      </Button>
    </form>
  );
};

export default StudyPlanForm;
