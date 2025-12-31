import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, Clock } from "lucide-react";

export interface StudySession {
  time: string;
  activity: string;
  duration: string;
  type: "study" | "break" | "review";
}

export interface StudyPlan {
  subject: string;
  totalHours: number;
  scenario: string;
  sessions: StudySession[];
  tips: string[];
}

interface StudyPlanDisplayProps {
  plan: StudyPlan;
  onDownload: () => void;
}

const StudyPlanDisplay = ({ plan, onDownload }: StudyPlanDisplayProps) => {
  const getTypeStyles = (type: StudySession["type"]) => {
    switch (type) {
      case "study":
        return "bg-primary/10 border-primary/20 text-primary";
      case "break":
        return "bg-accent/10 border-accent/20 text-accent";
      case "review":
        return "bg-success/10 border-success/20 text-success";
      default:
        return "bg-muted border-border text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground capitalize">
            {plan.subject} Study Plan
          </h3>
          <p className="text-sm text-muted-foreground">
            {plan.totalHours} hours · {plan.scenario.replace("-", " ")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </div>

      <div className="space-y-3">
        {plan.sessions.map((session, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 rounded-xl border-2 p-4 transition-all hover:shadow-soft ${getTypeStyles(session.type)}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card shadow-sm">
              {session.type === "break" ? (
                <Clock className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{session.activity}</p>
              <p className="text-sm opacity-80">{session.time}</p>
            </div>
            <span className="rounded-full bg-card px-3 py-1 text-xs font-medium shadow-sm">
              {session.duration}
            </span>
          </div>
        ))}
      </div>

      {plan.tips.length > 0 && (
        <div className="rounded-xl bg-secondary/50 p-4">
          <h4 className="mb-2 font-heading font-semibold text-foreground">
            Study Tips
          </h4>
          <ul className="space-y-1">
            {plan.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-secondary-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StudyPlanDisplay;
