import { useEffect, useState, useCallback } from "react";
import { Calendar, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getAvailableSubjects,
  generateStudyPlan,
  downloadSchedule,
  AvailableSubjectsResponse,
  GenerateStudyPlanRequest,
  GenerateStudyPlanResponse
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function StudyPlanPage() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState<GenerateStudyPlanResponse | null>(null);
  const [formData, setFormData] = useState<GenerateStudyPlanRequest>({
    subject: "",
    total_hours: 10,
    difficulty: "medium"
  });
  const { toast } = useToast();

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const response: AvailableSubjectsResponse = await getAvailableSubjects();
      setSubjects(response.available_subjects);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      toast({
        title: "Error",
        description: "Failed to load available subjects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleGenerate = async () => {
    if (!formData.subject || !formData.total_hours) {
      toast({
        title: "Validation Error",
        description: "Please select a subject and enter total hours.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const plan = await generateStudyPlan(formData);
      setStudyPlan(plan);
      toast({
        title: "Success",
        description: "Study plan generated successfully!",
      });
    } catch (error) {
      console.error("Failed to generate study plan:", error);
      toast({
        title: "Error",
        description: "Failed to generate study plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!studyPlan) return;

    try {
      await downloadSchedule(studyPlan.subject, studyPlan.total_hours);
      toast({
        title: "Success",
        description: "Study plan downloaded successfully!",
      });
    } catch (error) {
      console.error("Failed to download study plan:", error);
      toast({
        title: "Error",
        description: "Failed to download study plan. Please try again.",
        variant: "destructive",
      });
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Plan Generator</h1>
          <p className="text-muted-foreground mt-1">
            Create personalized AI-generated study plans tailored to your needs
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Generate Study Plan
            </CardTitle>
            <CardDescription>
              Select your subject, study hours, and difficulty level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData({ ...formData, subject: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours">Total Study Hours</Label>
              <Input
                id="hours"
                type="number"
                min="1"
                max="100"
                value={formData.total_hours}
                onChange={(e) => setFormData({ ...formData, total_hours: parseInt(e.target.value) || 0 })}
                placeholder="Enter total hours"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating || loading}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Generate Study Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Your Study Plan</CardTitle>
            <CardDescription>
              {studyPlan ? "Here's your personalized study schedule" : "Generate a plan to see results"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studyPlan ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{studyPlan.subject}</h3>
                    <Badge className={getDifficultyColor(studyPlan.difficulty)}>
                      {studyPlan.difficulty}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Hours:</span>
                    <span className="font-medium ml-2">{studyPlan.total_hours}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Days:</span>
                    <span className="font-medium ml-2">{studyPlan.num_days}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hours/Day:</span>
                    <span className="font-medium ml-2">{studyPlan.hours_per_day.toFixed(1)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {studyPlan.daily_schedule.map((day) => (
                    <div key={day.day} className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Day {day.day}</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Topics:</span> {day.topics.join(", ")}</p>
                        <p><span className="text-muted-foreground">Minutes per topic:</span> {day.minutes_per_topic}</p>
                        <p><span className="text-muted-foreground">Total minutes:</span> {day.total_minutes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No study plan generated yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Fill out the form and click "Generate Study Plan" to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
