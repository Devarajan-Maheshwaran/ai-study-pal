import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  Target,
  TrendingUp,
  Play,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, getUserId, SubjectsResponse, DashboardResponse, HealthResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SubjectStats {
  subject: string;
  attempts: number;
  correct: number;
  avg_accuracy: number;
}

interface DashboardData {
  topics_studied: number;
  total_attempts: number;
  correct_answers: number;
  avg_accuracy: number;
  per_subject: SubjectStats[];
}

export default function DashboardPage() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [subjectsData, dashboardData, healthData] = await Promise.all([
        api.subjects(),
        api.dashboard(getUserId()),
        api.health(),
      ]);
      setSubjects(subjectsData.subjects);
      setStats(dashboardData);
      setIsHealthy(healthData.status === "ok");
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the backend. Make sure your Flask server is running.",
        variant: "destructive",
      });
      setIsHealthy(false);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);



  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and continue learning
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>Available Subjects</CardTitle>
          <CardDescription>Choose a subject to start learning</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <Card key={subject} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{subject}</h3>
                        <p className="text-sm text-muted-foreground">Start learning</p>
                      </div>
                      <Button size="sm" onClick={() => navigate(`/adaptive-quiz?subject=${subject}`)}>
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Notes to MCQs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Generate quiz questions from your study notes
            </p>
            <Button onClick={() => navigate("/notes-to-mcqs")}>
              Get Started
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Adaptive Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Take a personalized quiz based on your progress
            </p>
            <Button onClick={() => navigate("/adaptive-quiz")}>
              Start Quiz
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Discover curated learning resources
            </p>
            <Button onClick={() => navigate("/resources")}>
              Explore
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
